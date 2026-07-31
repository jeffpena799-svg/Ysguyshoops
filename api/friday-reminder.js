import postgres from "postgres";
import webpush from "web-push";

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL;
const sql = postgres(connectionString, { ssl: "require", max: 1, idle_timeout: 20 });

function isFridayAtSix(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const weekday = parts.find(part => part.type === "weekday")?.value;
  const hour = parts.find(part => part.type === "hour")?.value;
  return weekday === "Fri" && hour === "18";
}

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
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed" });

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.authorization !== `Bearer ${cronSecret}`) {
    return response.status(401).json({ error: "Unauthorized" });
  }

  if (!isFridayAtSix()) return response.status(200).json({ sent: 0, skipped: "Outside Friday 6:00 PM Eastern" });

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
    const subscriptions = await sql`SELECT endpoint, subscription FROM push_subscriptions WHERE enabled = TRUE`;
    const payload = JSON.stringify({
      title: "Sunday Run RSVP",
      body: "Are you in for Sunday morning? Open Y’s Guys and choose In, Maybe, or Out.",
      url: "/",
      tag: "friday-sunday-rsvp",
    });
    let sent = 0;
    let removed = 0;
    let failed = 0;

    for (const row of subscriptions) {
      try {
        await webpush.sendNotification(row.subscription, payload, { TTL: 60 * 60 * 12, urgency: "normal" });
        sent += 1;
      } catch (error) {
        if (error?.statusCode === 404 || error?.statusCode === 410) {
          await sql`DELETE FROM push_subscriptions WHERE endpoint = ${row.endpoint}`;
          removed += 1;
        } else {
          failed += 1;
          console.error("friday-reminder-send", row.endpoint, error?.statusCode || error);
        }
      }
    }

    return response.status(200).json({ sent, removed, failed, total: subscriptions.length });
  } catch (error) {
    console.error("friday-reminder-api", error);
    return response.status(500).json({ error: "Friday reminders could not be sent" });
  }
}

export { isFridayAtSix };
