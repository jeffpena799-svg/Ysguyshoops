import { isAuthorized } from "./_auth.js";

const MAX_IMAGE_LENGTH = 4_000_000;

export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  if (!isAuthorized(request)) return response.status(401).json({ error: "Commissioner login required" });
  if (!process.env.OPENAI_API_KEY) return response.status(503).json({ error: "The stats scanner is not connected yet" });

  const imageDataUrl = request.body?.imageDataUrl;
  const players = request.body?.players;
  if (typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/") || imageDataUrl.length > MAX_IMAGE_LENGTH) {
    return response.status(400).json({ error: "Upload a smaller stats picture" });
  }
  if (!Array.isArray(players) || !players.length || players.length > 60) {
    return response.status(400).json({ error: "A valid player roster is required" });
  }

  const roster = players.map(player => ({
    id: String(player.id || "").slice(0, 80),
    name: String(player.name || "").slice(0, 80),
    nickname: String(player.nickname || "").slice(0, 80),
  })).filter(player => player.id && player.name);

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: [{ role: "user", content: [
          { type: "input_text", text: `Read this Y's Guys weekly basketball totals sheet. Match only players from this roster: ${JSON.stringify(roster)}. Extract whole-day totals for GP, wins, points, rebounds, assists, steals, blocks, and turnovers. If steals or blocks are not present on the source, use 0 rather than guessing. Do not guess unreadable values. Omit absent players. Set uncertain true when any value or name match needs human review.` },
          { type: "input_image", image_url: imageDataUrl, detail: "high" },
        ] }],
        text: { format: { type: "json_schema", name: "weekly_basketball_stats", strict: true, schema: {
          type: "object", additionalProperties: false, required: ["lines", "warning"], properties: {
            warning: { type: "string" },
            lines: { type: "array", items: { type: "object", additionalProperties: false,
              required: ["playerId", "gp", "wins", "pts", "reb", "ast", "steals", "blocks", "turnovers", "uncertain"],
              properties: {
                playerId: { type: "string", enum: roster.map(player => player.id) },
                gp: { type: "integer", minimum: 0 }, wins: { type: "integer", minimum: 0 },
                pts: { type: "integer", minimum: 0 }, reb: { type: "integer", minimum: 0 }, ast: { type: "integer", minimum: 0 },
                steals: { type: "integer", minimum: 0 }, blocks: { type: "integer", minimum: 0 }, turnovers: { type: "integer", minimum: 0 },
                uncertain: { type: "boolean" },
              },
            } },
          },
        } } },
      }),
    });

    const result = await openaiResponse.json();
    if (!openaiResponse.ok) {
      console.error("scan-stats-openai", openaiResponse.status, result?.error?.code || result?.error?.type || "unknown");
      return response.status(502).json({ error: "The picture could not be read right now" });
    }
    const outputText = result.output_text || result.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text;
    const parsed = JSON.parse(outputText || "{}");
    const unique = new Set();
    const lines = (Array.isArray(parsed.lines) ? parsed.lines : []).filter(line => {
      if (!roster.some(player => player.id === line.playerId) || unique.has(line.playerId)) return false;
      unique.add(line.playerId); return true;
    }).map(line => {
      const gp = Math.max(0, Math.round(Number(line.gp) || 0));
      const wins = Math.min(gp, Math.max(0, Math.round(Number(line.wins) || 0)));
      return {
        playerId: line.playerId, gp, wins,
        pts: Math.max(0, Math.round(Number(line.pts) || 0)),
        reb: Math.max(0, Math.round(Number(line.reb) || 0)),
        ast: Math.max(0, Math.round(Number(line.ast) || 0)),
        steals: Math.max(0, Math.round(Number(line.steals) || 0)),
        blocks: Math.max(0, Math.round(Number(line.blocks) || 0)),
        turnovers: Math.max(0, Math.round(Number(line.turnovers) || 0)),
        uncertain: Boolean(line.uncertain),
      };
    });
    return response.status(200).json({ lines, warning: String(parsed.warning || "") });
  } catch (error) {
    console.error("scan-stats", error);
    return response.status(500).json({ error: "The picture could not be read right now" });
  }
}
