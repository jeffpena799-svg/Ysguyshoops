import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
const sql = postgres(connectionString, { ssl: "require", max: 1, idle_timeout: 20 });
const allowedPositions = new Set(["PG", "SG", "SF", "PF", "C", "G", "F", "G/F", "F/C"]);

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  const { playerId, position, photoUrl } = request.body ?? {};
  const hasPosition = typeof position === "string";
  const hasPhoto = typeof photoUrl === "string";
  if (typeof playerId !== "string" || (!hasPosition && !hasPhoto)) return response.status(400).json({ error: "Choose a profile update" });
  if (hasPosition && !allowedPositions.has(position)) return response.status(400).json({ error: "Choose a valid player position" });
  if (hasPhoto && (!photoUrl.startsWith("data:image/jpeg;base64,") || photoUrl.length > 1_600_000)) {
    return response.status(400).json({ error: "Choose a smaller profile picture" });
  }
  try {
    const result = await sql.begin(async transaction => {
      const rows = await transaction`SELECT data, revision FROM league_state WHERE id = 1 FOR UPDATE`;
      if (!rows.length) throw new Error("LEAGUE_NOT_FOUND");
      const data = rows[0].data;
      const players = Array.isArray(data.players) ? data.players : [];
      if (!players.some(player => player.id === playerId)) throw new Error("PLAYER_NOT_FOUND");
      const nextPlayers = players.map(player => player.id === playerId ? {
        ...player,
        ...(hasPosition ? { position } : {}),
        ...(hasPhoto ? { photoUrl } : {}),
      } : player);
      const nextData = { ...data, players: nextPlayers };
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
      return { players: nextPlayers, revision: updated[0].revision, updatedAt: updated[0].updated_at };
    });
    return response.status(200).json(result);
  } catch (error) {
    const messages = {
      LEAGUE_NOT_FOUND: "League data is not ready",
      PLAYER_NOT_FOUND: "That player is no longer on the active roster",
    };
    if (messages[error.message]) return response.status(409).json({ error: messages[error.message] });
    console.error("player-profile-api", error);
    return response.status(500).json({ error: "Profile update is temporarily unavailable" });
  }
}
