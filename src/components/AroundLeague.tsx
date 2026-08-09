import React, { useMemo, useState } from "react";

type Player={id:string;name:string;nickname:string;position:string;wins:number;losses:number;pts:number;reb:number;ast:number;photoUrl?:string};
type RankingEntry={playerId?:string;playerName:string;rank:number|null;movement:number|null;dnp:boolean;reason:string};
type Snapshot={entries:RankingEntry[]};
type SortKey="name"|"ppg"|"rpg"|"apg"|"wins"|"losses";
type LeagueView="rankings"|"stats";

const gp=(p:Player)=>Math.max(1,p.wins+p.losses);
const avg=(n:number,p:Player)=>Number((n/gp(p)).toFixed(1));
const initials=(name:string)=>name.split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase();

export default function AroundLeague({players,snapshot,onOpen}:{players:Player[];snapshot:Snapshot;onOpen:(player:Player)=>void;getOverall:(player:Player)=>number|null}){
  const [sortKey,setSortKey]=useState<SortKey>("ppg");
  const [direction,setDirection]=useState<"asc"|"desc">("desc");
  const [leagueView,setLeagueView]=useState<LeagueView>("stats");
  const rankingRows=useMemo(()=>[...snapshot.entries].filter(entry=>!entry.dnp&&entry.rank!==null).sort((a,b)=>(a.rank??999)-(b.rank??999)),[snapshot]);
  const statRows=useMemo(()=>{
    const rows=[...players];
    rows.sort((a,b)=>{
      const values=(p:Player)=>({name:p.name.toLowerCase(),ppg:avg(p.pts,p),rpg:avg(p.reb,p),apg:avg(p.ast,p),wins:p.wins,losses:p.losses});
      const av=values(a)[sortKey],bv=values(b)[sortKey];
      if(typeof av==="string"&&typeof bv==="string")return direction==="asc"?av.localeCompare(bv):bv.localeCompare(av);
      return direction==="asc"?Number(av)-Number(bv):Number(bv)-Number(av);
    });
    return rows;
  },[players,sortKey,direction]);
  const setSort=(key:SortKey)=>{if(sortKey===key)setDirection(current=>current==="desc"?"asc":"desc");else{setSortKey(key);setDirection(key==="name"?"asc":"desc")}};
  const arrow=(key:SortKey)=>sortKey===key?(direction==="desc"?" ↓":" ↑"):"";
  return <div className="atlPage atlCompactPage">
    <header className="atlHead"><span>AROUND THE LEAGUE</span><h1>League headquarters.</h1></header>

    <nav className="atlViewTabs atlViewTabsTwo" aria-label="Around the League sections">
      <button className={leagueView==="rankings"?"active":""} onClick={()=>setLeagueView("rankings")}><b>Rankings</b><small>{rankingRows.length} players</small></button>
      <button className={leagueView==="stats"?"active":""} onClick={()=>setLeagueView("stats")}><b>Per Game Stats</b><small>Sortable</small></button>
    </nav>

    {leagueView==="rankings"&&<section className="atlSection atlDashboardSection"><div className="atlTitle"><div><small>FULL BOARD</small><h2>Power Rankings</h2></div><span>No Overall shown</span></div><div className="atlRankings atlDashboardScroll">{rankingRows.map(entry=>{const player=players.find(item=>item.id===entry.playerId);return <button key={`${entry.playerName}-${entry.rank}`} className="atlRankRow" onClick={()=>player&&onOpen(player)} disabled={!player}><strong>#{entry.rank}</strong>{player?.photoUrl?<img src={player.photoUrl} alt=""/>:<span className="atlAvatar">{initials(entry.playerName)}</span>}<div><b>{entry.playerName}</b><small>{player?`${player.wins}-${player.losses}`:"League player"}</small></div><em className={(entry.movement??0)>0?"up":(entry.movement??0)<0?"down":"flat"}>{(entry.movement??0)>0?`↑ ${entry.movement}`:(entry.movement??0)<0?`↓ ${Math.abs(entry.movement??0)}`:"—"}</em></button>})}</div></section>}

    {leagueView==="stats"&&<section className="atlSection atlDashboardSection"><div className="atlTitle"><div><small>LEAGUE STATS</small><h2>Per Game Stats</h2></div><span>Tap to sort</span></div><div className="atlTableWrap atlDashboardScroll"><table className="atlTable"><thead><tr><th><button onClick={()=>setSort("name")}>Player{arrow("name")}</button></th><th><button onClick={()=>setSort("ppg")}>PPG{arrow("ppg")}</button></th><th><button onClick={()=>setSort("rpg")}>RPG{arrow("rpg")}</button></th><th><button onClick={()=>setSort("apg")}>APG{arrow("apg")}</button></th><th><button onClick={()=>setSort("wins")}>W{arrow("wins")}</button></th><th><button onClick={()=>setSort("losses")}>L{arrow("losses")}</button></th></tr></thead><tbody>{statRows.map(player=><tr key={player.id} onClick={()=>onOpen(player)}><td><span>{player.photoUrl?<img src={player.photoUrl} alt=""/>:<i>{initials(player.name)}</i>}<b>{player.name}</b></span></td><td>{avg(player.pts,player)}</td><td>{avg(player.reb,player)}</td><td>{avg(player.ast,player)}</td><td>{player.wins}</td><td>{player.losses}</td></tr>)}</tbody></table></div></section>}
  </div>;
}
