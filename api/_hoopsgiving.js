import postgres from "postgres";
import crypto from "node:crypto";
import { isAuthorized } from "./_auth.js";

const sql = postgres(process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.SUPABASE_DATABASE_URL, { ssl: "require", max: 1, idle_timeout: 20 });
const statuses = new Set(["draft", "open", "closed", "archived"]);
const attendance = new Set(["going", "maybe", "out"]);
function publicEvent(event) {
  const { payments, ...visible } = event;
  return visible;
}
export default async function handler(request, response) {
  response.setHeader("Cache-Control", "no-store");
  if (!["GET", "POST"].includes(request.method)) return response.status(405).json({ error: "Method not allowed" });
  const admin = Boolean(request.headers.authorization) && isAuthorized(request);
  if (request.method === "GET" && request.query?.admin === "1" && !admin) return response.status(401).json({ error: "Commissioner sign-in required" });
  const body = request.body || {};
  if (request.method === "POST" && body.action !== "rsvp" && !admin) return response.status(401).json({ error: "Commissioner sign-in required" });
  try {
    await sql`CREATE TABLE IF NOT EXISTS hoopsgiving_events (id TEXT PRIMARY KEY, data JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    if (request.method === "GET") {
      const rows = await sql`SELECT data FROM hoopsgiving_events ORDER BY updated_at DESC`;
      const events = rows.map(row => row.data);
      return response.status(200).json({ events: admin ? events : events.filter(event => ["open", "closed"].includes(event.status)).map(publicEvent) });
    }
    const result = await sql.begin(async tx => {
      if (body.action === "create") {
        const event = { id: `hoopsgiving-${crypto.randomUUID()}`, title: "Hoopsgiving", date: "", location: "", notes: "", status: "draft", responses: [], payments: {} };
        await tx`INSERT INTO hoopsgiving_events (id, data) VALUES (${event.id}, ${tx.json(event)})`;
        return event;
      }
      if (typeof body.eventId !== "string") throw new Error("Choose an event");
      const rows = await tx`SELECT data FROM hoopsgiving_events WHERE id = ${body.eventId} FOR UPDATE`;
      if (!rows.length) throw new Error("That event is no longer available");
      const event = rows[0].data;
      if (body.action === "delete") {
        if (body.confirmation !== "DELETE") throw new Error("Confirm deletion first");
        await tx`DELETE FROM hoopsgiving_events WHERE id = ${event.id}`;
        return null;
      }
      if (body.action === "edit") {
        if (!statuses.has(body.status)) throw new Error("Choose a valid event status");
        for (const [key, limit] of [["title", 80], ["date", 40], ["location", 160], ["notes", 600]]) {
          if (typeof body[key] !== "string" || body[key].length > limit) throw new Error("Event details are too long or invalid");
          event[key] = body[key].trim();
        }
        if (!event.title) throw new Error("Enter an event title");
        event.status = body.status;
      } else if (body.action === "rsvp" || body.action === "payment") {
        const league = await tx`SELECT data FROM league_state WHERE id = 1`;
        if (!league[0]?.data?.players?.some(player => player.id === body.playerId)) throw new Error("Choose your existing My Player profile first");
        if (body.action === "payment") {
          if (typeof body.paid !== "boolean") throw new Error("Choose paid or unpaid");
          event.payments = { ...event.payments, [body.playerId]: body.paid };
        } else {
          if (event.status !== "open") throw new Error("Sign-ups are closed for this event");
          if (!attendance.has(body.status) || typeof body.food !== "string" || body.food.length > 160) throw new Error("Choose attendance and food under 160 characters");
          const entry = { playerId: body.playerId, status: body.status, food: body.food.trim(), updatedAt: new Date().toISOString() };
          event.responses = [...event.responses.filter(item => item.playerId !== body.playerId), entry];
        }
      } else throw new Error("Choose a valid action");
      await tx`UPDATE hoopsgiving_events SET data = ${tx.json(event)}, updated_at = NOW() WHERE id = ${event.id}`;
      return event;
    });
    return response.status(200).json({ event: result && (admin ? result : publicEvent(result)) });
  } catch (error) {
    console.error("hoopsgiving-api", error);
    return response.status(400).json({ error: error.message?.startsWith("Choose") || error.message?.startsWith("Enter") || error.message?.startsWith("Confirm") || error.message?.startsWith("Sign-ups") || error.message?.startsWith("That event") || error.message?.startsWith("Event details") ? error.message : "Hoopsgiving is temporarily unavailable. Please retry." });
  }
}
