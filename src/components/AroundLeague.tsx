import React, { useMemo, useState } from "react";

type Player={
  id:string;name:string;nickname:string;position:string;wins:number;losses:number;
  pts:number;reb:number;ast:number;turnovers:number;stocks?:number;stl?:number;blk?:number;
  defensiveGp?:number;photoUrl?:string
};
type RankingEntry={playerId?:string;playerName:string;rank:number|null;movement:number|null;dnp:boolean;reason:string};
type Snapshot={entries:RankingEntry[];week?:number;date?:string};
type SortKey="name"|"gp"|"wins"|"losses"|"winPct"|"pts"|"reb"|"ast"|"turnovers"|"stocks";
type StatMode="averages"|"totals";
type Tab="rankings"|"stats"|"players";

const gamesPlayed=(player:Player)=>Math.max(1,player.wins+player.losses);
const avg=(value:number,player:Player)=>Number((value/gamesPlayed(player)).toFixed(1));
const defensiveTotal=(player:Player)=>player.stocks??((player.stl??0)+(player.blk??0));
const defensiveAvg=(player:Player)=>player.defensiveGp?Number((defensiveTotal(player)/player.defensiveGp).toFixed(1)):0;
const pct=(player:Player)=>player.wins+player.losses?Math.round((player.wins/(player.wins+player.losses))*100):0;
const initials=(name:string)=>name.split(/\s+/).map(part=>part[0]).join("").slice(0,2).toUpperCase();
const movement=(value:number|null)=>value&&value>0?`▲ ${value}`:value&&value<0?`▼ ${Math.abs(value)}`:"—";

export default function AroundLeague<T extends Player>({players,snapshot,onOpen,getOverall}:{players:T[];snapshot:Snapshot;onOpen:(player:T)=>void;getOverall:(player:T)=>number|null}){
  const [activeTab,setActiveTab]=useState<Tab>("rankings");
  const [statMode,setStatMode]=useState<StatMode>("averages");
  const [sortKey,setSortKey]=useState<SortKey>("pts");
  const [direction,setDirection]=useState<"asc"|"desc">("desc");
  const [query,setQuery]=useState("");
  const rankingByPlayer=useMemo(()=>new Map(snapshot.entries.filter(entry=>entry.playerId).map(entry=>[entry.playerId!,entry])),[snapshot]);
  const rankingRows=useMemo(()=>[...snapshot.entries].filter(entry=>!entry.dnp&&entry.rank!==null).sort((a,b)=>(a.rank??999)-(b.rank??999)),[snapshot]);
  const topEntry=rankingRows[0];
  const topPlayer=players.find(player=>player.id===topEntry?.playerId);
  const statValue=(player:Player,key:Exclude<SortKey,"name">)=>{
    if(key==="gp")return player.wins+player.losses;
    if(key==="wins")return player.wins;
    if(key==="losses")return player.losses;
    if(key==="winPct")return pct(player);
    if(key==="stocks")return statMode==="averages"?defensiveAvg(player):defensiveTotal(player);
    return statMode==="averages"?avg(player[key],player):player[key];
  };
  const statRows=useMemo(()=>{
    const rows=[...players];
    rows.sort((a,b)=>{
      const left=sortKey==="name"?a.name.toLowerCase():statValue(a,sortKey);
      const right=sortKey==="name"?b.name.toLowerCase():statValue(b,sortKey);
      if(typeof left==="string"&&typeof right==="string")return direction==="asc"?left.localeCompare(right):right.localeCompare(left);
      return direction==="asc"?Number(left)-Number(right):Number(right)-Number(left);
    });
    return rows;
  },[players,sortKey,direction,statMode]);
  const communityPlayers=useMemo(()=>players.filter(player=>`${player.name} ${player.nickname}`.toLowerCase().includes(query.trim().toLowerCase())).sort((a,b)=>a.name.localeCompare(b.name)),[players,query]);
  const leaders=useMemo(()=>{
    const best=(value:(player:T)=>number)=>[...players].sort((a,b)=>value(b)-value(a))[0];
    return statMode==="averages"?[
      {label:"PPG",player:best(player=>avg(player.pts,player)),value:(player:T)=>avg(player.pts,player)},
      {label:"RPG",player:best(player=>avg(player.reb,player)),value:(player:T)=>avg(player.reb,player)},
      {label:"APG",player:best(player=>avg(player.ast,player)),value:(player:T)=>avg(player.ast,player)},
      {label:"STL+BLK/G",player:best(player=>defensiveAvg(player)),value:(player:T)=>defensiveAvg(player)},
    ]:[
      {label:"POINTS",player:best(player=>player.pts),value:(player:T)=>player.pts},
      {label:"REBOUNDS",player:best(player=>player.reb),value:(player:T)=>player.reb},
      {label:"ASSISTS",player:best(player=>player.ast),value:(player:T)=>player.ast},
      {label:"STL+BLK",player:best(player=>defensiveTotal(player)),value:(player:T)=>defensiveTotal(player)},
    ];
  },[players,statMode]);
  const setSort=(key:SortKey)=>{if(sortKey===key)setDirection(current=>current==="desc"?"asc":"desc");else{setSortKey(key);setDirection(key==="name"?"asc":"desc")}};
  const arrow=(key:SortKey)=>sortKey===key?(direction==="desc"?" ↓":" ↑"):"";
  const tabs:[Tab,string,string][]=[["rankings","Power Rankings","RANK"],["stats","League Stats","STATS"],["players","Players","ROSTER"]];
  const statColumns:{key:Exclude<SortKey,"name">;average:string;total:string}[]=[
    {key:"gp",average:"GP",total:"GP"},{key:"wins",average:"W",total:"W"},{key:"losses",average:"L",total:"L"},{key:"winPct",average:"WIN%",total:"WIN%"},
    {key:"pts",average:"PPG",total:"PTS"},{key:"reb",average:"RPG",total:"REB"},{key:"ast",average:"APG",total:"AST"},{key:"turnovers",average:"TO/G",total:"TO"},{key:"stocks",average:"STL+BLK/G",total:"STL+BLK"},
  ];

  return <div className="atlPage atlBroadcast">
    <header className="atlBroadcastHead">
      <div><span><i/> Y'S GUYS NETWORK</span><h1>League Central</h1><p>Rankings, numbers, and every player shaping the league.</p></div>
      <aside><small>{snapshot.week?`WEEK ${snapshot.week}`:"LATEST BOARD"}</small><b>{rankingRows.length}</b><span>RANKED PLAYERS</span></aside>
    </header>

    <nav className="atlTabs" aria-label="Around the League views">{tabs.map(([key,label,short])=><button className={activeTab===key?"active":""} onClick={()=>setActiveTab(key)} key={key}><small>{short}</small><b>{label}</b></button>)}</nav>

    {activeTab==="rankings"&&<section className="atlTabPanel">
      {topEntry&&<button className="atlTopRank" onClick={()=>topPlayer&&onOpen(topPlayer)} disabled={!topPlayer}>
        <div className="atlTopPortrait">{topPlayer?.photoUrl?<img src={topPlayer.photoUrl} alt=""/>:<span>{initials(topEntry.playerName)}</span>}<strong>#1</strong></div>
        <div className="atlTopCopy"><small>TOP OF THE POWER BOARD</small><h2>{topEntry.playerName}</h2><p>{topEntry.reason||"The league's current standard."}</p><div><b>{topPlayer?`${topPlayer.wins}-${topPlayer.losses}`:"—"}<small>RECORD</small></b><b>{topPlayer?`${pct(topPlayer)}%`:"—"}<small>WIN RATE</small></b><b>{topPlayer?getOverall(topPlayer)??"PROV":"—"}<small>OVERALL</small></b></div></div>
        <span className={(topEntry.movement??0)>0?"up":(topEntry.movement??0)<0?"down":"flat"}>{movement(topEntry.movement)}</span>
      </button>}
      <div className="atlBoardHeader"><div><small>POWER RANKINGS</small><h2>The full board</h2></div><span>Commissioner ranking · latest release</span></div>
      <div className="atlRankings atlBroadcastRankings">{rankingRows.slice(topEntry?1:0).map(entry=>{const player=players.find(item=>item.id===entry.playerId);return <button key={`${entry.playerName}-${entry.rank}`} className="atlRankRow" onClick={()=>player&&onOpen(player)} disabled={!player}><strong>#{entry.rank}</strong>{player?.photoUrl?<img src={player.photoUrl} alt=""/>:<span className="atlAvatar">{initials(entry.playerName)}</span>}<div><b>{entry.playerName}</b><small>{entry.reason||"Power ranking update"}</small></div><span className="atlRankRecord">{player?`${player.wins}-${player.losses}`:"—"}<small>REC</small></span><span className="atlRankOverall">{player?getOverall(player)??"P":"—"}<small>OVR</small></span><em className={(entry.movement??0)>0?"up":(entry.movement??0)<0?"down":"flat"}>{movement(entry.movement)}</em></button>})}</div>
    </section>}

    {activeTab==="stats"&&<section className="atlTabPanel atlStatsPanel">
      <div className="atlBoardHeader"><div><small>LEAGUE LEADERS</small><h2>Top of the stat sheet</h2></div><span>{statMode==="averages"?"Per-game averages":"Career totals"} · live data</span></div>
      <div className="atlLeaderStrip">{leaders.map(item=>item.player&&<button onClick={()=>onOpen(item.player)} key={item.label}><small>{item.label}</small><strong>{item.value(item.player)}</strong><span>{item.player.name}</span></button>)}</div>
      <div className="atlStatsToolbar"><div><small>FULL STAT BOARD</small><h2>{statMode==="averages"?"Per-game averages":"Career totals"}</h2></div><div className="atlStatMode" role="group" aria-label="Choose stat display"><button className={statMode==="averages"?"active":""} aria-pressed={statMode==="averages"} onClick={()=>setStatMode("averages")}>AVERAGES</button><button className={statMode==="totals"?"active":""} aria-pressed={statMode==="totals"} onClick={()=>setStatMode("totals")}>TOTALS</button></div><span>Tap a heading to sort</span></div>
      <p className="atlLandscapeHint">Rotate your phone for the complete landscape stat board.</p>
      <div className="atlTableWrap atlStatTableWrap" role="region" aria-label={`${statMode==="averages"?"Average":"Total"} league statistics`} tabIndex={0}><table className="atlTable atlStatTable"><thead><tr><th><button onClick={()=>setSort("name")}>Player{arrow("name")}</button></th>{statColumns.map(column=><th key={column.key}><button onClick={()=>setSort(column.key)}>{statMode==="averages"?column.average:column.total}{arrow(column.key)}</button></th>)}</tr></thead><tbody>{statRows.map((player,index)=><tr key={player.id} onClick={()=>onOpen(player)}><td><span><em>{index+1}</em>{player.photoUrl?<img src={player.photoUrl} alt=""/>:<i>{initials(player.name)}</i>}<b>{player.name}</b></span></td>{statColumns.map(column=><td key={column.key}>{statValue(player,column.key)}</td>)}</tr>)}</tbody></table></div>
    </section>}

    {activeTab==="players"&&<section className="atlTabPanel">
      <div className="atlBoardHeader atlPlayersTitle"><div><small>LEAGUE ROSTER</small><h2>Meet the players</h2></div><input aria-label="Search players" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search name or nickname…"/></div>
      <div className="atlPlayerGrid">{communityPlayers.map(player=>{const rank=rankingByPlayer.get(player.id)?.rank;const overall=getOverall(player);return <button className="atlPlayerCard" key={player.id} onClick={()=>onOpen(player)}><div className="atlPlayerHero">{player.photoUrl?<img src={player.photoUrl} alt=""/>:<span>{initials(player.name)}</span>}<div><small>{rank?`#${rank} IN LEAGUE`:"Y'S GUYS PLAYER"}</small><h3>{player.name}</h3><p>{player.position} · “{player.nickname}”</p></div>{overall!==null&&<strong>{overall}<small>OVR</small></strong>}</div><div className="atlPlayerStats"><span><b>{player.wins}-{player.losses}</b><small>RECORD</small></span><span><b>{pct(player)}%</b><small>WIN %</small></span><span><b>{avg(player.pts,player)}</b><small>PPG</small></span><span><b>{defensiveAvg(player)}</b><small>STL+BLK/G</small></span></div><footer>OPEN PLAYER PROFILE <i>→</i></footer></button>})}</div>
    </section>}
  </div>;
}
