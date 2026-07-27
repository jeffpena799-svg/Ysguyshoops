import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
const sql = postgres(connectionString, { ssl: "require", max: 1, idle_timeout: 20 });

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  const { pollId, voterId, nomineeId } = request.body ?? {};
  if (![pollId, voterId, nomineeId].every(value => typeof value === "string" && value.length < 120)) {
    return response.status(400).json({ error: "Choose your name and a nominee" });
  }
  try {
    const result = await sql.begin(async transaction => {
      const rows = await transaction`SELECT data FROM league_state WHERE id = 1 FOR UPDATE`;
      if (!rows.length) throw new Error("LEAGUE_NOT_FOUND");
      const data = rows[0].data;
      const polls = Array.isArray(data.polls) ? data.polls : [];
      const pollIndex = polls.findIndex(poll => poll.id === pollId);
      if (pollIndex < 0) throw new Error("POLL_NOT_FOUND");
      const poll = polls[pollIndex];
      if (poll.status !== "open") throw new Error("POLL_CLOSED");
      if (!Array.isArray(data.players) || !data.players.some(player => player.id === voterId)) throw new Error("VOTER_NOT_FOUND");
      if (!Array.isArray(poll.nomineeIds) || !poll.nomineeIds.includes(nomineeId)) throw new Error("NOMINEE_NOT_FOUND");
      const vote = { playerId: voterId, nomineeId, updatedAt: new Date().toISOString() };
      const existing = Array.isArray(poll.votes) ? poll.votes : [];
      const nextPoll = { ...poll, votes: existing.some(item => item.playerId === voterId) ? existing.map(item => item.playerId === voterId ? vote : item) : [...existing, vote] };
      const nextData = { ...data, polls: polls.map((item, index) => index === pollIndex ? nextPoll : item) };
      const updated = await transaction`
        UPDATE league_state
        SET data = ${transaction.json(nextData)}, revision = revision + 1, updated_at = NOW()
        WHERE id = 1
        RETURNING revision, updated_at
      `;
      await transaction`
        INSERT INTO league_history (revision, data, created_at)
        VALUES (${updated[0].revision}, ${transaction.json(nextData)}, ${updated[0].updated_at})
        ON CONFLICT (revision) DO NOTHING
      `;
      return { polls: nextData.polls, revision: updated[0].revision, updatedAt: updated[0].updated_at };
    });
    return response.status(200).json(result);
  } catch (error) {
    const messages = {
      LEAGUE_NOT_FOUND: "League data is not ready",
      POLL_NOT_FOUND: "That poll is no longer available",
      POLL_CLOSED: "Voting is closed",
      VOTER_NOT_FOUND: "That player is no longer on the active roster",
      NOMINEE_NOT_FOUND: "That nominee is no longer on the ballot",
    };
    if (messages[error.message]) return response.status(409).json({ error: messages[error.message] });
    console.error("vote-api", error);
    return response.status(500).json({ error: "Voting is temporarily unavailable" });
  }
}
