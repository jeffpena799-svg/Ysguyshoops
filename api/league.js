import postgres from "postgres";
import { isAuthorized } from "./_auth.js";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
const sql = postgres(connectionString, { ssl: "require", max: 1, idle_timeout: 20 });

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
      return response.status(200).json({ data: rows[0].data, revision: rows[0].revision, updatedAt: rows[0].updated_at });
    }
    if (request.method === "PUT") {
      if (!isAuthorized(request)) return response.status(401).json({ error: "Commissioner login required" });
      const data = request.body?.data;
      if (!data || !Array.isArray(data.players) || !Array.isArray(data.games) || !Array.isArray(data.awards) || !Array.isArray(data.seasons) || (data.news !== undefined && !Array.isArray(data.news))) {
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
