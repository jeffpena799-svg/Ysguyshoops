import React, { useMemo, useState } from "react";

type Player={id:string;name:string;nickname:string;position:string;wins:number;losses:number;pts:number;reb:number;ast:number;stocks?:number;stl?:number;blk?:number;defensiveGp?:number;photoUrl?:string};
type RankingEntry={playerId?:string;playerName:string;rank:number|null;movement:number|null;dnp:boolean;reason:string};
type Snapshot={entries:RankingEntry[]};
type SortKey="name"|"ppg"|"rpg"|"apg"|"stockspg"|"wins"|"losses";

const gp=(p:Player)=>Math.max(1,p.wins+p.losses);
const avg=(n:number,p:Player)=>Number((n/gp(p)).toFixed(1));
const defensiveTotal=(p:Player)=>p.stocks??((p.stl??0)+(p.blk??0));
const defensiveAvg=(p:Player)=>p.defensiveGp?Number((defensiveTotal(p)/p.defensiveGp).toFixed(1)):0;
const pct=(p:Player)=>p.wins+p.losses?Math.round((p.wins/(p.wins+p.losses))*100):0;
const initials=(name:string)=>name.split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase();

export default function AroundLeague<T extends Player>({players,snapshot,onOpen,getOverall}:{players:T[];snapshot:Snapshot;onOpen:(player:T)=>void;getOverall:(player:T)=>number|null}){
  const [sortKey,setSortKey]=useState<SortKey>("ppg");
  const [direction,setDirection]=useState<"asc"|"desc">("desc");
  const [query,setQuery]=useState("");
  const rankingByPlayer=useMemo(()=>new Map(snapshot.entries.filter(entry=>entry.playerId).map(entry=>[entry.playerId!,entry])),[snapshot]);
  const rankingRows=useMemo(()=>[...snapshot.entries].filter(entry=>!entry.dnp&&entry.rank!==null).sort((a,b)=>(a.rank??999)-(b.rank??999)),[snapshot]);
  const statRows=useMemo(()=>{
    const rows=[...players];
    rows.sort((a,b)=>{
      const values=(p:Player)=>({name:p.name.toLowerCase(),ppg:avg(p.pts,p),rpg:avg(p.reb,p),apg:avg(p.ast,p),stockspg:defensiveAvg(p),wins:p.wins,losses:p.losses});
      const av=values(a)[sortKey],bv=values(b)[sortKey];
      if(typeof av==="string"&&typeof bv==="string")return direction==="asc"?av.localeCompare(bv):bv.localeCompare(av);
      return direction==="asc"?Number(av)-Number(bv):Number(bv)-Number(av);
    });
    return rows;
  },[players,sortKey,direction]);
  const communityPlayers=useMemo(()=>players.filter(player=>`${player.name} ${player.nickname}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name)),[players,query]);
  const setSort=(key:SortKey)=>{if(sortKey===key)setDirection(current=>current==="desc"?"asc":"desc");else{setSortKey(key);setDirection(key==="name"?"asc":"desc")}};
  const arrow=(key:SortKey)=>sortKey===key?(direction==="desc"?" ↓":" ↑"):"";
  return <div className="atlPage">
    <header className="atlHead"><span>AROUND THE LEAGUE</span><h1>League headquarters.</h1><p>Rankings, sortable stats, and the full Y's Guys player community.</p></header>

    <section className="atlSection"><div className="atlTitle"><div><small>FULL BOARD</small><h2>Power Rankings</h2></div><span>{rankingRows.length} ranked</span></div><div className="atlRankings">{rankingRows.map(entry=>{const player=players.find(item=>item.id===entry.playerId);return <button key={`${entry.playerName}-${entry.rank}`} className="atlRankRow" onClick={()=>player&&onOpen(player)} disabled={!player}><strong>#{entry.rank}</strong>{player?.photoUrl?<img src={player.photoUrl} alt=""/>:<span className="atlAvatar">{initials(entry.playerName)}</span>}<div><b>{entry.playerName}</b><small>{player?`${player.wins}-${player.losses}`:"League player"}</small></div><em className={(entry.movement??0)>0?"up":(entry.movement??0)<0?"down":"flat"}>{(entry.movement??0)>0?`↑ ${entry.movement}`:(entry.movement??0)<0?`↓ ${Math.abs(entry.movement??0)}`:"—"}</em></button>})}</div></section>

    <section className="atlSection"><div className="atlTitle"><div><small>LEAGUE STATS</small><h2>Current averages</h2></div><span>Tap a column to sort</span></div><div className="atlTableWrap"><table className="atlTable"><thead><tr><th><button onClick={()=>setSort("name")}>Player{arrow("name")}</button></th><th><button onClick={()=>setSort("ppg")}>PPG{arrow("ppg")}</button></th><th><button onClick={()=>setSort("rpg")}>RPG{arrow("rpg")}</button></th><th><button onClick={()=>setSort("apg")}>APG{arrow("apg")}</button></th><th><button onClick={()=>setSort("stockspg")}>STL+BLK/G{arrow("stockspg")}</button></th><th><button onClick={()=>setSort("wins")}>W{arrow("wins")}</button></th><th><button onClick={()=>setSort("losses")}>L{arrow("losses")}</button></th></tr></thead><tbody>{statRows.map(player=><tr key={player.id} onClick={()=>onOpen(player)}><td><span>{player.photoUrl?<img src={player.photoUrl} alt=""/>:<i>{initials(player.name)}</i>}<b>{player.name}</b></span></td><td>{avg(player.pts,player)}</td><td>{avg(player.reb,player)}</td><td>{avg(player.ast,player)}</td><td>{defensiveAvg(player)}</td><td>{player.wins}</td><td>{player.losses}</td></tr>)}</tbody></table></div></section>

    <section className="atlSection"><div className="atlTitle atlPlayersTitle"><div><small>COMMUNITY</small><h2>Players</h2></div><input aria-label="Search players" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search players…"/></div><div className="atlPlayerGrid">{communityPlayers.map(player=>{const rank=rankingByPlayer.get(player.id)?.rank;const overall=getOverall(player);return <button className="atlPlayerCard" key={player.id} onClick={()=>onOpen(player)}><div className="atlPlayerHero">{player.photoUrl?<img src={player.photoUrl} alt=""/>:<span>{initials(player.name)}</span>}<div><small>{rank?`#${rank} IN LEAGUE`:"Y'S GUYS PLAYER"}</small><h3>{player.name}</h3><p>{player.position} · {player.nickname}</p></div>{overall!==null&&<strong>{overall}<small>OVR</small></strong>}</div><div className="atlPlayerStats"><span><b>{player.wins}-{player.losses}</b><small>RECORD</small></span><span><b>{pct(player)}%</b><small>WIN %</small></span><span><b>{avg(player.pts,player)}</b><small>PPG</small></span><span><b>{defensiveAvg(player)}</b><small>STL+BLK/G</small></span></div><footer>View Profile <i>→</i></footer></button>})}</div></section>
  </div>;
}
