import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
const sql = postgres(connectionString, { ssl: "require", max: 1, idle_timeout: 20 });
const allowedStatuses = new Set(["going", "maybe", "out"]);

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  const { runId, playerId, status, arrivalTime = "", note = "" } = request.body ?? {};
  if (typeof runId !== "string" || typeof playerId !== "string" || !allowedStatuses.has(status)) {
    return response.status(400).json({ error: "Choose a player and attendance response" });
  }
  if (String(arrivalTime).length > 40 || String(note).length > 140) {
    return response.status(400).json({ error: "Arrival time or note is too long" });
  }
  try {
    const result = await sql.begin(async transaction => {
      const rows = await transaction`SELECT data, revision FROM league_state WHERE id = 1 FOR UPDATE`;
      if (!rows.length) throw new Error("LEAGUE_NOT_FOUND");
      const data = rows[0].data;
      const runs = Array.isArray(data.runs) ? data.runs : [];
      const runIndex = runs.findIndex(run => run.id === runId);
      if (runIndex < 0) throw new Error("RUN_NOT_FOUND");
      if (!Array.isArray(data.players) || !data.players.some(player => player.id === playerId)) throw new Error("PLAYER_NOT_FOUND");
      const run = runs[runIndex];
      if (run.status !== "open") throw new Error("RUN_CLOSED");
      const rsvp = { playerId, status, arrivalTime: String(arrivalTime).trim(), note: String(note).trim(), updatedAt: new Date().toISOString() };
      const existing = Array.isArray(run.rsvps) ? run.rsvps : [];
      const nextRun = { ...run, rsvps: existing.some(item => item.playerId === playerId) ? existing.map(item => item.playerId === playerId ? rsvp : item) : [...existing, rsvp] };
      const nextData = { ...data, runs: runs.map((item, index) => index === runIndex ? nextRun : item) };
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
      return { runs: nextData.runs, revision: updated[0].revision, updatedAt: updated[0].updated_at };
    });
    return response.status(200).json(result);
  } catch (error) {
    const messages = {
      LEAGUE_NOT_FOUND: "League data is not ready",
      RUN_NOT_FOUND: "That Sunday is no longer available",
      PLAYER_NOT_FOUND: "That player is no longer on the active roster",
      RUN_CLOSED: "Attendance is locked for this Sunday",
    };
    if (messages[error.message]) return response.status(409).json({ error: messages[error.message] });
    console.error("rsvp-api", error);
    return response.status(500).json({ error: "Attendance is temporarily unavailable" });
  }
}
