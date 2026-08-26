import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
const sql = postgres(connectionString, { ssl: "require", max: 1, idle_timeout: 20 });
const allowedPositions = new Set(["", "PG", "SG", "SF", "PF", "C", "G", "F", "G/F", "F/C"]);

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });

  const rawName = typeof request.body?.name === "string" ? request.body.name.trim() : "";
  const rawNickname = typeof request.body?.nickname === "string" ? request.body.nickname.trim() : "";
  const position = typeof request.body?.position === "string" ? request.body.position.trim() : "";

  if (rawName.length < 2 || rawName.length > 60) return response.status(400).json({ error: "Enter your name" });
  if (rawNickname.length > 60) return response.status(400).json({ error: "Nickname is too long" });
  if (!allowedPositions.has(position)) return response.status(400).json({ error: "Choose a valid position" });

  try {
    const result = await sql.begin(async transaction => {
      const rows = await transaction`SELECT data, revision FROM league_state WHERE id = 1 FOR UPDATE`;
      if (!rows.length) throw new Error("LEAGUE_NOT_FOUND");

      const data = rows[0].data;
      const players = Array.isArray(data.players) ? data.players : [];
      const normalizedName = rawName.toLowerCase();
      const duplicate = players.find(player => typeof player?.name === "string" && player.name.trim().toLowerCase() === normalizedName);
      if (duplicate) {
        return { duplicate: true, player: duplicate };
      }

      const baseId = slugify(rawName) || `player-${Date.now()}`;
      let playerId = baseId;
      let suffix = 2;
      while (players.some(player => player.id === playerId)) {
        playerId = `${baseId}-${suffix++}`;
      }

      const player = {
        id: playerId,
        name: rawName,
        nickname: rawNickname || rawName,
        position: position || "G/F",
        wins: 0,
        losses: 0,
        pts: 0,
        reb: 0,
        ast: 0,
        turnovers: 0,
        awards: [],
        bio: "New to the Y's Guys universe.",
      };

      const nextPlayers = [...players, player];
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

      return { player, revision: updated[0].revision, updatedAt: updated[0].updated_at };
    });

    if (result.duplicate) {
      return response.status(409).json({ error: "That name already has a Y's Guys profile. Choose it from the existing-player list instead.", player: result.player });
    }

    return response.status(201).json(result);
  } catch (error) {
    if (error?.message === "LEAGUE_NOT_FOUND") return response.status(409).json({ error: "League data is not ready" });
    console.error("create-player-api", error);
    return response.status(500).json({ error: "Profile creation is temporarily unavailable" });
  }
}

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
