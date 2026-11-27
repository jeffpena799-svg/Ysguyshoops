export type SeasonSystem = {
  version: 1;
  activeSeasonId: string;
  activeSeasonName: string;
};

export type SeasonArchivePlayer = {
  id: string;
  name: string;
  nickname?: string;
  position?: string;
  wins: number;
  losses: number;
  pts: number;
  reb: number;
  ast: number;
  turnovers: number;
  stocks?: number;
  defensiveGp?: number;
};

export type SeasonArchive = {
  id: string;
  name: string;
  status: "Archived";
  archivedAt: string;
  playerStats: SeasonArchivePlayer[];
  awards: Array<{season:string;name:string;winner:string;winnerId?:string;icon:string}>;
  weeklyMvps: Array<{id:string;date:string;winnerId:string;winnerName:string}>;
};

type SeasonSession = {
  seasonId?: string;
  lines: Array<{playerId:string;gp:number;wins:number;pts:number;reb:number;ast:number;turnovers:number;stocks?:number;stl?:number;blk?:number}>;
};

type CareerPlayer = SeasonArchivePlayer & { stl?:number; blk?:number; [key:string]:unknown };

export const DEFAULT_SEASON_SYSTEM: SeasonSystem = {
  version: 1,
  activeSeasonId: "season-3",
  activeSeasonName: "Season 3",
};

export function buildSeasonRoster<T extends CareerPlayer>(players:T[], sessions:SeasonSession[], seasonId:string):T[] {
  const totals = new Map<string,{gp:number;wins:number;pts:number;reb:number;ast:number;turnovers:number;stocks:number;defensiveGp:number}>();
  for (const session of sessions) {
    if (session.seasonId !== seasonId) continue;
    for (const line of session.lines) {
      const current = totals.get(line.playerId) ?? {gp:0,wins:0,pts:0,reb:0,ast:0,turnovers:0,stocks:0,defensiveGp:0};
      const hasDefense = line.stocks !== undefined || line.stl !== undefined || line.blk !== undefined;
      current.gp += Number(line.gp) || 0;
      current.wins += Number(line.wins) || 0;
      current.pts += Number(line.pts) || 0;
      current.reb += Number(line.reb) || 0;
      current.ast += Number(line.ast) || 0;
      current.turnovers += Number(line.turnovers) || 0;
      current.stocks += Number(line.stocks ?? ((line.stl ?? 0) + (line.blk ?? 0))) || 0;
      if (hasDefense) current.defensiveGp += Number(line.gp) || 0;
      totals.set(line.playerId, current);
    }
  }
  return players.map(player => {
    const value = totals.get(player.id) ?? {gp:0,wins:0,pts:0,reb:0,ast:0,turnovers:0,stocks:0,defensiveGp:0};
    return {...player,wins:value.wins,losses:Math.max(0,value.gp-value.wins),pts:value.pts,reb:value.reb,ast:value.ast,turnovers:value.turnovers,stocks:value.stocks,stl:value.stocks,blk:0,defensiveGp:value.defensiveGp};
  });
}

function sessionTotals(sessions:SeasonSession[], seasonId:string) {
  const totals=new Map<string,{wins:number;losses:number;pts:number;reb:number;ast:number;turnovers:number;stocks:number;defensiveGp:number}>();
  for(const session of sessions){
    if(session.seasonId!==seasonId)continue;
    for(const line of session.lines){
      const value=totals.get(line.playerId)??{wins:0,losses:0,pts:0,reb:0,ast:0,turnovers:0,stocks:0,defensiveGp:0};
      const hasDefense=line.stocks!==undefined||line.stl!==undefined||line.blk!==undefined;
      value.wins+=Number(line.wins)||0;value.losses+=Math.max(0,(Number(line.gp)||0)-(Number(line.wins)||0));value.pts+=Number(line.pts)||0;value.reb+=Number(line.reb)||0;value.ast+=Number(line.ast)||0;value.turnovers+=Number(line.turnovers)||0;value.stocks+=Number(line.stocks??((line.stl??0)+(line.blk??0)))||0;if(hasDefense)value.defensiveGp+=Number(line.gp)||0;
      totals.set(line.playerId,value);
    }
  }
  return totals;
}

export function applyArchivedSessionCorrections(archives:SeasonArchive[],previousSessions:SeasonSession[],nextSessions:SeasonSession[]):SeasonArchive[]{
  return archives.map(archive=>{
    const before=sessionTotals(previousSessions,archive.id),after=sessionTotals(nextSessions,archive.id);
    const playerStats=archive.playerStats.map(player=>{
      const old=before.get(player.id)??{wins:0,losses:0,pts:0,reb:0,ast:0,turnovers:0,stocks:0,defensiveGp:0};
      const next=after.get(player.id)??{wins:0,losses:0,pts:0,reb:0,ast:0,turnovers:0,stocks:0,defensiveGp:0};
      return {...player,wins:player.wins+next.wins-old.wins,losses:player.losses+next.losses-old.losses,pts:player.pts+next.pts-old.pts,reb:player.reb+next.reb-old.reb,ast:player.ast+next.ast-old.ast,turnovers:player.turnovers+next.turnovers-old.turnovers,stocks:(player.stocks??0)+next.stocks-old.stocks,defensiveGp:(player.defensiveGp??0)+next.defensiveGp-old.defensiveGp};
    });
    return {...archive,playerStats};
  });
}
