import postgres from "postgres";
import { isAuthorized } from "./_auth.js";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
const sql = postgres(connectionString, { ssl: "require", max: 1, idle_timeout: 20 });

const HISTORICAL_WEEKLY_MVPS_2025 = {
  steve: 2,
  vic: 6,
  paul: 3,
  jose: 5,
  jeffrey: 3,
  ty: 1,
  alex: 5,
  "nick-d": 1,
  hunter: 2,
  mario: 3,
  dusko: 1,
  sal: 1,
};

export function applyHistoricalWeeklyMvpCredits(data) {
  if (!data || !Array.isArray(data.players)) return { data, changed: false };
  let changed = false;
  const players = data.players.map(player => {
    const normalizedName = String(player.name || "").trim().toLowerCase();
    const count = HISTORICAL_WEEKLY_MVPS_2025[player.id] ?? HISTORICAL_WEEKLY_MVPS_2025[normalizedName];
    if (!count) return player;
    const credits = Array.isArray(player.weeklyMvpCredits) ? [...player.weeklyMvpCredits] : [];
    const index = credits.findIndex(credit => credit?.id === "weekly-mvp-2025-history");
    const credit = { id: "weekly-mvp-2025-history", season: "2025", count };
    if (index === -1) credits.push(credit);
    else if (credits[index]?.season !== "2025" || Number(credits[index]?.count) !== count) credits[index] = credit;
    else return player;
    changed = true;
    return { ...player, weeklyMvpCredits: credits };
  });
  return { data: changed ? { ...data, players } : data, changed };
}

export function applyHistoricalTrophyCredits(data) {
  if (!data || !Array.isArray(data.players) || !Array.isArray(data.awards)) return { data, changed: false };
  const playerId = name => data.players.find(player => String(player.name || "").trim().toLowerCase() === name)?.id;
  const required = [
    { season: "2025", name: "Clutch Award", winner: "Sal Tinoco", winnerId: playerId("sal"), icon: "⏱️" },
    { season: "2025", name: "Locker Room Award", winner: "Mike", winnerId: playerId("mike"), icon: "🤝" },
  ].filter(award => award.winnerId);
  let changed = false;
  const awards = data.awards.map(award => ({ ...award }));
  for (const requiredAward of required) {
    const index = awards.findIndex(award => String(award.season) === requiredAward.season && String(award.name).trim().toLowerCase() === requiredAward.name.toLowerCase());
    if (index === -1) {
      awards.push(requiredAward);
      changed = true;
    } else if (awards[index].winnerId !== requiredAward.winnerId) {
      awards[index] = { ...awards[index], winnerId: requiredAward.winnerId };
      changed = true;
    }
  }
  return { data: changed ? { ...data, awards } : data, changed };
}

export function applyLeagueMigrations(data) {
  const weeklyMvp = applyHistoricalWeeklyMvpCredits(data);
  const trophies = applyHistoricalTrophyCredits(weeklyMvp.data);
  return { data: trophies.data, changed: weeklyMvp.changed || trophies.changed };
}

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS league_state (
      id INTEGER PRIMARY KEY,
      data JSONB NOT NULL,
      revision INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS league_history (
      revision INTEGER PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export default async function handler(request, response) {
  try {
    await ensureTable();
    if (request.method === "GET") {
      const historyRequested = new URL(request.url, "https://ysguyshoops.vercel.app").searchParams.get("history") === "1";
      if (historyRequested) {
        if (!isAuthorized(request)) return response.status(401).json({ error: "Commissioner login required" });
        const history = await sql`SELECT revision, created_at FROM league_history ORDER BY revision DESC LIMIT 30`;
        return response.status(200).json({ history: history.map(item => ({ revision: item.revision, createdAt: item.created_at })) });
      }
      const rows = await sql`SELECT data, revision, updated_at FROM league_state WHERE id = 1`;
      if (!rows.length) return response.status(200).json({ data: null, revision: 0, updatedAt: null });
      const migration = applyLeagueMigrations(rows[0].data);
      if (migration.changed) {
        const migrated = await sql`
          UPDATE league_state
          SET data = ${sql.json(migration.data)}, revision = revision + 1, updated_at = NOW()
          WHERE id = 1 AND revision = ${rows[0].revision}
          RETURNING data, revision, updated_at
        `;
        if (migrated.length) {
          await sql`
            INSERT INTO league_history (revision, data, created_at)
            VALUES (${migrated[0].revision}, ${sql.json(migrated[0].data)}, ${migrated[0].updated_at})
            ON CONFLICT (revision) DO NOTHING
          `;
          return response.status(200).json({ data: migrated[0].data, revision: migrated[0].revision, updatedAt: migrated[0].updated_at });
        }
        const refreshed = await sql`SELECT data, revision, updated_at FROM league_state WHERE id = 1`;
        return response.status(200).json({ data: refreshed[0].data, revision: refreshed[0].revision, updatedAt: refreshed[0].updated_at });
      }
      return response.status(200).json({ data: rows[0].data, revision: rows[0].revision, updatedAt: rows[0].updated_at });
    }
    if (request.method === "PUT") {
      if (!isAuthorized(request)) return response.status(401).json({ error: "Commissioner login required" });
      const data = request.body?.data;
      if (!data || !Array.isArray(data.players) || !Array.isArray(data.games) || !Array.isArray(data.awards) || !Array.isArray(data.seasons) || (data.news !== undefined && !Array.isArray(data.news)) || (data.runs !== undefined && !Array.isArray(data.runs))) {
        return response.status(400).json({ error: "Invalid league data" });
      }
      const serialized = JSON.stringify(data);
      if (serialized.length > 4_000_000) return response.status(413).json({ error: "League data is too large" });
      const rows = await sql`
        INSERT INTO league_state (id, data, revision, updated_at)
        VALUES (1, ${sql.json(data)}, 1, NOW())
        ON CONFLICT (id) DO UPDATE SET
          data = EXCLUDED.data,
          revision = league_state.revision + 1,
          updated_at = NOW()
        RETURNING revision, updated_at
      `;
      await sql`
        INSERT INTO league_history (revision, data, created_at)
        VALUES (${rows[0].revision}, ${sql.json(data)}, ${rows[0].updated_at})
        ON CONFLICT (revision) DO NOTHING
      `;
      return response.status(200).json({ ok: true, revision: rows[0].revision, updatedAt: rows[0].updated_at });
    }
    if (request.method === "POST") {
      if (!isAuthorized(request)) return response.status(401).json({ error: "Commissioner login required" });
      const revision = Number(request.body?.revision);
      if (!Number.isInteger(revision) || revision < 1) return response.status(400).json({ error: "Valid revision required" });
      const snapshots = await sql`SELECT data FROM league_history WHERE revision = ${revision}`;
      if (!snapshots.length) return response.status(404).json({ error: "Revision not found" });
      const rows = await sql`
        UPDATE league_state
        SET data = ${sql.json(snapshots[0].data)}, revision = revision + 1, updated_at = NOW()
        WHERE id = 1
        RETURNING data, revision, updated_at
      `;
      await sql`INSERT INTO league_history (revision, data, created_at) VALUES (${rows[0].revision}, ${sql.json(rows[0].data)}, ${rows[0].updated_at})`;
      return response.status(200).json({ data: rows[0].data, revision: rows[0].revision, updatedAt: rows[0].updated_at });
    }
    return response.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("league-api", error);
    return response.status(500).json({ error: "League storage is temporarily unavailable" });
  }
}
