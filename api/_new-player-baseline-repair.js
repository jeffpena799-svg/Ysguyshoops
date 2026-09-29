const PLAYER_REPAIRS = new Map([
  ["player-1786929747481-la8po", { name: "Rico", firstSunday: "2026-08-16" }],
  ["player-1786222560378-w87or", { name: "Anwar", firstSunday: "2026-08-10" }],
]);

const zeroBaseline = () => ({
  wins: 0,
  losses: 0,
  pts: 0,
  reb: 0,
  ast: 0,
  turnovers: 0,
  stocks: 0,
  defensiveGp: 0,
});

const number = value => Math.max(0, Number(value) || 0);

function publishedLinesForPlayer(sessions, playerId, firstSunday) {
  return sessions.flatMap(session => {
    if (session?.status !== "published" || String(session.date || "") < firstSunday || !Array.isArray(session.lines)) return [];
    return session.lines.filter(line => line?.playerId === playerId);
  });
}

function rebuildPlayer(player, lines) {
  const totals = lines.reduce((sum, line) => {
    const gp = number(line.gp);
    const wins = Math.min(gp, number(line.wins));
    const stocksTracked = line.stocks !== undefined || line.stl !== undefined || line.blk !== undefined;
    return {
      wins: sum.wins + wins,
      losses: sum.losses + Math.max(0, gp - wins),
      pts: sum.pts + number(line.pts),
      reb: sum.reb + number(line.reb),
      ast: sum.ast + number(line.ast),
      turnovers: sum.turnovers + number(line.turnovers),
      stocks: sum.stocks + (line.stocks === undefined ? number(line.stl) + number(line.blk) : number(line.stocks)),
      defensiveGp: sum.defensiveGp + (stocksTracked ? gp : 0),
    };
  }, zeroBaseline());

  const { formulaOverall: _discardedFormulaOverall, ...profile } = player;
  return { ...profile, ...totals };
}

export function applyNewPlayerBaselineRepair(data) {
  if (!data || !Array.isArray(data.players) || !Array.isArray(data.sundaySessions)) return { data, changed: false };

  const statBaseline = { ...(data.statBaseline || {}) };
  let changed = false;
  const players = data.players.map(player => {
    const repair = PLAYER_REPAIRS.get(player?.id);
    if (!repair || statBaseline[player.id]) return player;
    const lines = publishedLinesForPlayer(data.sundaySessions, player.id, repair.firstSunday);
    if (!lines.length) return player;
    statBaseline[player.id] = zeroBaseline();
    changed = true;
    return rebuildPlayer(player, lines);
  });

  return { data: changed ? { ...data, players, statBaseline } : data, changed };
}

