import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
const sql = postgres(connectionString, { ssl: "require", max: 1, idle_timeout: 20 });
const allowedPositions = new Set(["PG", "SG", "SF", "PF", "C", "G", "F", "G/F", "F/C"]);
const allowedCreatePositions = new Set(["", ...allowedPositions]);

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });

  const body = request.body ?? {};
  const action = body.action === "create" ? "create" : "update";

  if (action === "create") {
    const rawName = typeof body.name === "string" ? body.name.trim() : "";
    const rawNickname = typeof body.nickname === "string" ? body.nickname.trim() : "";
    const position = typeof body.position === "string" ? body.position.trim() : "";

    if (rawName.length < 2 || rawName.length > 60) return response.status(400).json({ error: "Enter your name" });
    if (rawNickname.length > 60) return response.status(400).json({ error: "Nickname is too long" });
    if (!allowedCreatePositions.has(position)) return response.status(400).json({ error: "Choose a valid position" });

    try {
      const result = await sql.begin(async transaction => {
        const rows = await transaction`SELECT data, revision FROM league_state WHERE id = 1 FOR UPDATE`;
        if (!rows.length) throw new Error("LEAGUE_NOT_FOUND");

        const data = rows[0].data;
        const players = Array.isArray(data.players) ? data.players : [];
        const normalizedName = rawName.toLowerCase();
        const duplicate = players.find(player => typeof player?.name === "string" && player.name.trim().toLowerCase() === normalizedName);
        if (duplicate) return { duplicate: true, player: duplicate };

        const baseId = slugify(rawName) || `player-${Date.now()}`;
        let playerId = baseId;
        let suffix = 2;
        while (players.some(player => player.id === playerId)) playerId = `${baseId}-${suffix++}`;

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
        return { player, players: nextPlayers, revision: updated[0].revision, updatedAt: updated[0].updated_at };
      });

      if (result.duplicate) {
        return response.status(409).json({ error: "That name already has a Y's Guys profile. Choose it from the existing-player list instead.", player: result.player });
      }
      return response.status(201).json(result);
    } catch (error) {
      if (error?.message === "LEAGUE_NOT_FOUND") return response.status(409).json({ error: "League data is not ready" });
      console.error("player-profile-create-api", error);
      return response.status(500).json({ error: "Profile creation is temporarily unavailable" });
    }
  }

  const { playerId, position, photoUrl } = body;
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

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}
