import postgres from "postgres";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
const sql = postgres(connectionString, { ssl: "require", max: 1, idle_timeout: 20 });

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint TEXT PRIMARY KEY,
      subscription JSONB NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

function validSubscription(subscription) {
  return subscription
    && typeof subscription.endpoint === "string"
    && subscription.endpoint.startsWith("https://")
    && typeof subscription.keys?.p256dh === "string"
    && typeof subscription.keys?.auth === "string"
    && subscription.endpoint.length <= 2048
    && subscription.keys.p256dh.length <= 512
    && subscription.keys.auth.length <= 256;
}

export default async function handler(request, response) {
  if (!['POST', 'DELETE'].includes(request.method)) return response.status(405).json({ error: "Method not allowed" });

  try {
    await ensureTable();

    if (request.method === "POST") {
      const { subscription } = request.body ?? {};
      if (!validSubscription(subscription)) return response.status(400).json({ error: "That notification subscription is not valid" });

      await sql`
        INSERT INTO push_subscriptions (endpoint, subscription, enabled, updated_at)
        VALUES (${subscription.endpoint}, ${sql.json(subscription)}, TRUE, NOW())
        ON CONFLICT (endpoint)
        DO UPDATE SET subscription = EXCLUDED.subscription, enabled = TRUE, updated_at = NOW()
      `;
      return response.status(200).json({ enabled: true });
    }

    const { endpoint } = request.body ?? {};
    if (typeof endpoint !== "string" || !endpoint.startsWith("https://")) {
      return response.status(400).json({ error: "Choose a reminder subscription to disable" });
    }
    await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
    return response.status(200).json({ enabled: false });
  } catch (error) {
    console.error("push-subscription-api", error);
    return response.status(500).json({ error: "Friday reminder settings are temporarily unavailable" });
  }
}
