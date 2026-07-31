export default function handler(request, response) {
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed" });

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) return response.status(503).json({ error: "Friday reminders are not configured yet" });

  response.setHeader("Cache-Control", "public, max-age=3600, s-maxage=3600");
  return response.status(200).json({ publicKey });
}
