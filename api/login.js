import { createSession, passwordMatches } from "./_auth.js";

export default function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  if (!passwordMatches(request.body?.password)) return response.status(401).json({ error: "Incorrect password" });
  return response.status(200).json({ token: createSession(), expiresIn: 604800 });
}
