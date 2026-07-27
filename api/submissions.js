import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
const sql = postgres(connectionString, { ssl: "require", max: 1, idle_timeout: 20 });

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  const { type, playerId, message, imageUrl } = request.body ?? {};
  if (!["profile-photo", "suggestion"].includes(type) || typeof playerId !== "string" || typeof message !== "string") {
    return response.status(400).json({ error: "Choose your player and add a message" });
  }
  if (message.trim().length < 3 || message.length > 1200) return response.status(400).json({ error: "Message must be 3–1,200 characters" });
  if (imageUrl !== undefined && (typeof imageUrl !== "string" || imageUrl.length > 900_000 || !imageUrl.startsWith("data:image/"))) {
    return response.status(413).json({ error: "That picture is too large" });
  }
  if (type === "profile-photo" && !imageUrl) return response.status(400).json({ error: "Choose a profile picture" });
  try {
    const result = await sql.begin(async transaction => {
      const rows = await transaction`SELECT data FROM league_state WHERE id = 1 FOR UPDATE`;
      if (!rows.length) throw new Error("LEAGUE_NOT_FOUND");
      const data = rows[0].data;
      if (!Array.isArray(data.players) || !data.players.some(player => player.id === playerId)) throw new Error("PLAYER_NOT_FOUND");
      const submissions = Array.isArray(data.submissions) ? data.submissions : [];
      if (submissions.filter(item => item.status === "pending" && item.playerId === playerId).length >= 5) throw new Error("TOO_MANY_PENDING");
      const submission = {
        id: `submission-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        type, playerId, message: message.trim(), imageUrl, status: "pending", createdAt: new Date().toISOString(),
      };
      const nextData = { ...data, submissions: [submission, ...submissions] };
      const updated = await transaction`
        UPDATE league_state SET data = ${transaction.json(nextData)}, revision = revision + 1, updated_at = NOW()
        WHERE id = 1 RETURNING revision, updated_at
      `;
      await transaction`
        INSERT INTO league_history (revision, data, created_at)
        VALUES (${updated[0].revision}, ${transaction.json(nextData)}, ${updated[0].updated_at})
        ON CONFLICT (revision) DO NOTHING
      `;
      return { submissions: nextData.submissions, revision: updated[0].revision, updatedAt: updated[0].updated_at };
    });
    return response.status(200).json(result);
  } catch (error) {
    const messages = {
      LEAGUE_NOT_FOUND: "League data is not ready",
      PLAYER_NOT_FOUND: "That player is no longer available",
      TOO_MANY_PENDING: "The Commissioner already has several items waiting from this player",
    };
    if (messages[error.message]) return response.status(409).json({ error: messages[error.message] });
    console.error("submissions-api", error);
    return response.status(500).json({ error: "The suggestion box is temporarily unavailable" });
  }
}
