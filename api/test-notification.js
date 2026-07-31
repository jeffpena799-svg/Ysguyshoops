import postgres from "postgres";
import webpush from "web-push";

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

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });

  const { endpoint } = request.body ?? {};
  if (typeof endpoint !== "string" || !endpoint.startsWith("https://")) {
    return response.status(400).json({ error: "Enable reminders before sending a test" });
  }

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return response.status(503).json({ error: "Push credentials are not configured" });

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:notifications@ysguyshoops.vercel.app",
    publicKey,
    privateKey,
  );

  try {
    await ensureTable();
    const rows = await sql`
      SELECT subscription
      FROM push_subscriptions
      WHERE endpoint = ${endpoint} AND enabled = TRUE
      LIMIT 1
    `;
    if (!rows.length) return response.status(404).json({ error: "This phone is not registered. Enable reminders again." });

    const payload = JSON.stringify({
      title: "Y's Guys reminder test",
      body: "Notifications are working. You’re ready for Friday RSVP reminders.",
      url: "/",
      tag: "friday-reminder-test",
    });
    await webpush.sendNotification(rows[0].subscription, payload, { TTL: 60 * 5, urgency: "high" });
    console.log("test-notification-result", { sent: 1 });
    return response.status(200).json({ sent: true });
  } catch (error) {
    const statusCode = error?.statusCode;
    console.error("test-notification-send", { statusCode: statusCode || null, message: error?.message || String(error) });
    if (statusCode === 404 || statusCode === 410) {
      await sql`DELETE FROM push_subscriptions WHERE endpoint = ${endpoint}`;
      return response.status(410).json({ error: "This phone subscription expired. Enable reminders again." });
    }
    return response.status(500).json({ error: "The test notification could not be sent" });
  }
}
