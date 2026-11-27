export const SEASON_TWO_ID = "season-2";
export const SEASON_THREE_ID = "season-3";

const seasonTwoAward = award => /season\s*2|2026/i.test(String(award?.season || ""));

export function applySeasonThreeMigration(data) {
  if (!data || !Array.isArray(data.players)) return { data, changed: false };
  if (data.seasonSystem?.version === 1) return { data, changed: false };

  const playerStats = data.players.map(player => ({
    id: player.id,
    name: player.name,
    nickname: player.nickname,
    position: player.position,
    wins: Number(player.wins) || 0,
    losses: Number(player.losses) || 0,
    pts: Number(player.pts) || 0,
    reb: Number(player.reb) || 0,
    ast: Number(player.ast) || 0,
    turnovers: Number(player.turnovers) || 0,
    stocks: Number(player.stocks ?? ((player.stl || 0) + (player.blk || 0))) || 0,
    defensiveGp: Number(player.defensiveGp) || 0,
  }));
  const weeklyMvps = (data.polls || [])
    .filter(poll => poll?.category === "Weekly Award" && poll?.status === "closed" && poll?.officialWinnerId)
    .map(poll => {
      const winner = data.players.find(player => player.id === poll.officialWinnerId);
      return {
        id: poll.id,
        date: String(poll.deadline || poll.finalizedAt || poll.createdAt || "").slice(0, 10),
        winnerId: poll.officialWinnerId,
        winnerName: winner?.name || "Unknown player",
      };
    })
    .sort((a, b) => b.date.localeCompare(a.date));
  const seasonTwoArchive = {
    id: SEASON_TWO_ID,
    name: "Season 2",
    status: "Archived",
    archivedAt: new Date().toISOString(),
    playerStats,
    awards: (data.awards || []).filter(seasonTwoAward),
    weeklyMvps,
  };
  const legacySeasons = (data.seasons || []).filter(season => !/summer\s*2026|season\s*[23]/i.test(String(season?.name || "")));
  const seasons = [
    { id: SEASON_THREE_ID, name: "Season 3", status: "Active", games: 0, champion: "TBD" },
    { id: SEASON_TWO_ID, name: "Season 2", status: "Archived", games: (data.sundaySessions || []).length, champion: "—" },
    ...legacySeasons,
  ];
  return {
    changed: true,
    data: {
      ...data,
      seasons,
      seasonSystem: { version: 1, activeSeasonId: SEASON_THREE_ID, activeSeasonName: "Season 3" },
      seasonArchives: [...(data.seasonArchives || []).filter(archive => archive?.id !== SEASON_TWO_ID), seasonTwoArchive],
      sundaySessions: (data.sundaySessions || []).map(session => ({...session, seasonId: session.seasonId || SEASON_TWO_ID})),
      rankings: (data.rankings || []).map(ranking => ({...ranking, seasonId: ranking.seasonId || SEASON_TWO_ID})),
    },
  };
}
