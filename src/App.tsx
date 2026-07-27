import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const NAVY = "#0A2D5E";
const GOLD = "#C7A24D";

type Player = {
  id: string; name: string; nickname: string; position: string;
  wins: number; losses: number; pts: number; reb: number; ast: number; turnovers: number;
  awards: string[]; bio: string; jerseyNumber?:string; height?:string; strengths?:string;
  signatureBadge?:string; photoUrl?:string; bannerColor?:string;
};

type StatLine = { playerId:string; team:string; pts:number; reb:number; ast:number; turnovers:number };
type GameStatus = "scheduled" | "final";
type Game = { id: string; date: string; startTime?:string; location?:string; status?:GameStatus; title: string; teamA: string; scoreA: number; teamB: string; scoreB: number; mvp: string; recap: string; boxScore?:StatLine[] };
type Award = { season: string; name: string; winner: string; icon: string };
type RecordItem = { category: string; label: string; holder: string; value: string; date: string };

type View = "home" | "games" | "players" | "profile" | "compare" | "leaders" | "more" | "records" | "awards" | "seasons" | "standings" | "calendar" | "rules" | "hof" | "commissioner";

const initialPlayers: Player[] = [
  { id:"steve", name:"Steve", nickname:"Lefty", position:"G", wins:13, losses:5, pts:69, reb:62, ast:19, turnovers:8, awards:[], bio:"A high-impact two-way guard with elite rebounding from the perimeter." },
  { id:"vic", name:"Vic", nickname:"Henny Vic", position:"G", wins:12, losses:5, pts:73, reb:34, ast:17, turnovers:16, awards:["2025 Most Improved"], bio:"Aggressive scorer who can change the pace of a game in a hurry." },
  { id:"paul", name:"Paul Peters", nickname:"MVP", position:"F", wins:17, losses:4, pts:56, reb:39, ast:21, turnovers:7, awards:["2025 MVP"], bio:"Winning, versatility and consistency define the league's reigning MVP." },
  { id:"jose", name:"Jose", nickname:"Jose Jose Jose", position:"G", wins:7, losses:8, pts:61, reb:28, ast:8, turnovers:2, awards:[], bio:"A fearless scorer with a knack for timely buckets." },
  { id:"jeffrey", name:"Jeffrey", nickname:"Jeff", position:"SF", wins:6, losses:9, pts:58, reb:62, ast:12, turnovers:15, awards:[], bio:"Physical wing who can defend across positions and create inside." },
  { id:"ty", name:"Ty", nickname:"Ty Bry", position:"G", wins:13, losses:5, pts:45, reb:41, ast:23, turnovers:2, awards:[], bio:"Efficient connector who impacts winning with passing and defense." },
  { id:"nick-p", name:"Nick Peters", nickname:"Nick P", position:"G", wins:4, losses:8, pts:36, reb:31, ast:17, turnovers:1, awards:[], bio:"Confident shooter and playmaker with major upside." },
  { id:"alex", name:"Alex", nickname:"Big Al", position:"F", wins:5, losses:10, pts:53, reb:32, ast:19, turnovers:8, awards:["2025 Caruso Hustle Award"], bio:"High-energy forward who brings effort, passing and toughness." },
  { id:"nick-d", name:"Nick D", nickname:"Nick", position:"G", wins:5, losses:10, pts:32, reb:29, ast:19, turnovers:4, awards:["2025 Defensive Player of the Year"], bio:"Point-of-attack defender and steady secondary creator." },
  { id:"hunter", name:"Hunter", nickname:"Hunter Guy", position:"G", wins:3, losses:5, pts:18, reb:16, ast:9, turnovers:1, awards:[], bio:"Young guard with a balanced game and calm decision-making." },
  { id:"mario", name:"Mario", nickname:"Mario", position:"F", wins:6, losses:8, pts:24, reb:36, ast:17, turnovers:8, awards:[], bio:"Versatile frontcourt player who rebounds and keeps the ball moving." },
  { id:"mike", name:"Mike", nickname:"Big Mike", position:"C", wins:1, losses:5, pts:12, reb:11, ast:11, turnovers:6, awards:["2025 Locker Room Award"], bio:"Team-first big man who creates space and keeps everyone involved." },
];

const initialGames: Game[] = [
  { id:"g-0719", date:"July 19, 2026", title:"Summer League Week 1", teamA:"Navy", scoreA:74, teamB:"Gold", scoreB:69, mvp:"Vic", recap:"Vic set the scoring tone while Navy held off a late Gold rally in the opening week." },
  { id:"g-0726", date:"July 26, 2026", title:"Summer League Week 2", teamA:"Cream", scoreA:66, teamB:"Navy", scoreB:63, mvp:"Paul Peters", recap:"Paul controlled the final minutes as Cream survived a one-possession finish." },
];

const initialAwards: Award[] = [
  { season:"2025", name:"Most Valuable Player", winner:"Paul Peters", icon:"👑" },
  { season:"2025", name:"Defensive Player of the Year", winner:"Nick D", icon:"🛡️" },
  { season:"2025", name:"Most Improved", winner:"Vic", icon:"📈" },
  { season:"2025", name:"Clutch Award", winner:"Sal Tinoco", icon:"⏱️" },
  { season:"2025", name:"Caruso Hustle Award", winner:"Alex", icon:"🔥" },
  { season:"2025", name:"Locker Room Award", winner:"Mike", icon:"🤝" },
];

const initialRecords: RecordItem[] = [
  { category:"Career", label:"Most Points", holder:"Vic", value:"73", date:"Through July 26, 2026" },
  { category:"Career", label:"Most Rebounds", holder:"Steve / Jeffrey", value:"62", date:"Through July 26, 2026" },
  { category:"Career", label:"Most Assists", holder:"Ty", value:"23", date:"Through July 26, 2026" },
  { category:"Career", label:"Best Win Percentage", holder:"Paul Peters", value:"81.0%", date:"Minimum 10 games" },
  { category:"Team", label:"Best Record", holder:"Paul Peters", value:"17–4", date:"Current season" },
  { category:"League", label:"Closest Game", holder:"Cream vs Navy", value:"3 points", date:"July 26, 2026" },
];

const initialSeasons = [
  { name:"Summer 2026", status:"Active", games:2, champion:"TBD" },
  { name:"2025 Awards Season", status:"Archived", games:0, champion:"—" },
];

type LeagueData = { players: Player[]; games: Game[]; awards: Award[]; seasons: typeof initialSeasons };

function gp(p: Player){ return p.wins+p.losses; }
function pct(p: Player){ return gp(p) ? Math.round((p.wins/gp(p))*1000)/10 : 0; }
function avg(v:number,p:Player){ return gp(p) ? Math.round((v/gp(p))*10)/10 : 0; }
function initials(name:string){ return name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase(); }
function legacyPercentage(p:Player){
  const winning=Math.min(30,pct(p)*.3),production=Math.min(30,(p.pts+p.reb+p.ast)/7),honors=Math.min(25,p.awards.length*12.5),experience=Math.min(15,gp(p)*.6);
  return Math.max(1,Math.min(100,Math.round(winning+production+honors+experience)));
}
function overallRating(p:Player){ return Math.min(99,Math.round(60+avg(p.pts,p)*1.4+avg(p.reb,p)+avg(p.ast,p)*1.2+pct(p)*.08)); }
function archetype(p:Player){
  const stats=[["Scoring Threat",avg(p.pts,p)],["Glass Cleaner",avg(p.reb,p)],["Floor General",avg(p.ast,p)*1.7],["Winning Connector",pct(p)/12]] as const;
  return [...stats].sort((a,b)=>b[1]-a[1])[0][0];
}
function playerBadges(p:Player){
  const badges:{icon:string;name:string;level:"Gold"|"Silver"|"Bronze"}[]=[];
  if(avg(p.pts,p)>=4)badges.push({icon:"🎯",name:"Bucket Getter",level:avg(p.pts,p)>=5?"Gold":"Silver"});
  if(avg(p.reb,p)>=3)badges.push({icon:"🧲",name:"Glass Cleaner",level:avg(p.reb,p)>=4?"Gold":"Silver"});
  if(avg(p.ast,p)>=1.3)badges.push({icon:"🪄",name:"Dimer",level:avg(p.ast,p)>=2?"Gold":"Silver"});
  if(pct(p)>=65)badges.push({icon:"👑",name:"Winner",level:pct(p)>=75?"Gold":"Silver"});
  if(gp(p)>=15)badges.push({icon:"⚙️",name:"Iron Man",level:gp(p)>=20?"Gold":"Bronze"});
  if(p.awards.length)badges.push({icon:"🏆",name:"Award Winner",level:p.awards.length>1?"Gold":"Silver"});
  return badges.length?badges:[{icon:"🚀",name:"Rising Player",level:"Bronze" as const}];
}
function loadData<T>(key:string,fallback:T):T {
  try {
    const stored=localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    return fallback;
  }
}
function exportData(data:LeagueData){
  const blob=new Blob([JSON.stringify({...data,exportedAt:new Date().toISOString(),version:"2.2"},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;link.download=`ys-guys-backup-${new Date().toISOString().slice(0,10)}.json`;link.click();
  URL.revokeObjectURL(url);
}
function makeId(prefix:string){ return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`; }
function isFinal(game:Game){ return (game.status??"final")==="final"; }
function applyBoxScoreDelta(players:Player[],oldGame:Game|undefined,newGame:Game|undefined){
  const apply=(list:Player[],game:Game|undefined,multiplier:number)=>{
    if(!game?.boxScore?.length||!isFinal(game))return list;
    const winner=game.scoreA===game.scoreB?"":game.scoreA>game.scoreB?game.teamA:game.teamB;
    return list.map(player=>{
      const line=game.boxScore?.find(row=>row.playerId===player.id);if(!line)return player;
      return {...player,
        pts:Math.max(0,player.pts+line.pts*multiplier),reb:Math.max(0,player.reb+line.reb*multiplier),ast:Math.max(0,player.ast+line.ast*multiplier),turnovers:Math.max(0,player.turnovers+line.turnovers*multiplier),
        wins:Math.max(0,player.wins+(winner&&line.team===winner?multiplier:0)),
        losses:Math.max(0,player.losses+(winner&&line.team!==winner?multiplier:0))
      };
    });
  };
  return apply(apply(players,oldGame,-1),newGame,1);
}
function teamStandings(games:Game[]){
  const map=new Map<string,{team:string;wins:number;losses:number;pf:number;pa:number}>();
  const row=(team:string)=>{if(!map.has(team))map.set(team,{team,wins:0,losses:0,pf:0,pa:0});return map.get(team)!};
  games.filter(isFinal).forEach(game=>{const a=row(game.teamA),b=row(game.teamB);a.pf+=game.scoreA;a.pa+=game.scoreB;b.pf+=game.scoreB;b.pa+=game.scoreA;if(game.scoreA>game.scoreB){a.wins++;b.losses++}else if(game.scoreB>game.scoreA){b.wins++;a.losses++}});
  return [...map.values()].sort((a,b)=>b.wins-a.wins||(b.pf-b.pa)-(a.pf-a.pa));
}

export default function App(){
  const [view,setView]=useState<View>("home");
  const [selected,setSelected]=useState<Player|null>(null);
  const [search,setSearch]=useState("");
  const [leaderKey,setLeaderKey]=useState<"pts"|"reb"|"ast"|"wins">("pts");
  const [players,setPlayers]=useState<Player[]>(()=>loadData("yg-players",initialPlayers));
  const [games,setGames]=useState<Game[]>(()=>loadData("yg-games",initialGames));
  const [awards,setAwards]=useState<Award[]>(()=>loadData("yg-awards",initialAwards));
  const [seasons,setSeasons]=useState(()=>loadData("yg-seasons",initialSeasons));
  const [adminTab,setAdminTab]=useState<"games"|"players"|"awards"|"data">("games");
  const [toast,setToast]=useState("");
  const [sessionToken,setSessionToken]=useState(()=>sessionStorage.getItem("yg-session")??"");
  const [cloudStatus,setCloudStatus]=useState<"loading"|"cloud"|"local"|"saving"|"error">("loading");
  const [cloudUpdatedAt,setCloudUpdatedAt]=useState<string|null>(null);

  const saveAll=(next?:{players?:Player[];games?:Game[];awards?:Award[];seasons?:typeof initialSeasons})=>{
    const p=next?.players??players,g=next?.games??games,a=next?.awards??awards,se=next?.seasons??seasons;
    localStorage.setItem("yg-players",JSON.stringify(p));localStorage.setItem("yg-games",JSON.stringify(g));localStorage.setItem("yg-awards",JSON.stringify(a));localStorage.setItem("yg-seasons",JSON.stringify(se));
    const data={players:p,games:g,awards:a,seasons:se};
    if(sessionToken){
      setCloudStatus("saving");
      fetch("/api/league",{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${sessionToken}`},body:JSON.stringify({data})})
        .then(async response=>{if(response.status===401){sessionStorage.removeItem("yg-session");setSessionToken("");throw new Error("Session expired");}if(!response.ok)throw new Error();const result=await response.json();setCloudUpdatedAt(result.updatedAt);setCloudStatus("cloud");setToast("Saved for everyone");})
        .catch(()=>{setCloudStatus("error");setToast("Saved locally · cloud retry needed");})
        .finally(()=>setTimeout(()=>setToast(""),2200));
    }else{
      setToast("Saved on this device");setTimeout(()=>setToast(""),1800);
    }
  };
  const hydrateData=(data:LeagueData)=>{
    setPlayers(data.players);setGames(data.games);setAwards(data.awards);setSeasons(data.seasons);
    localStorage.setItem("yg-players",JSON.stringify(data.players));localStorage.setItem("yg-games",JSON.stringify(data.games));localStorage.setItem("yg-awards",JSON.stringify(data.awards));localStorage.setItem("yg-seasons",JSON.stringify(data.seasons));
  };
  const replaceData=(data:LeagueData)=>{hydrateData(data);saveAll(data);};
  const resetData=()=>{
    if(!confirm("Reset all locally saved changes and restore the original league data?")) return;
    replaceData({players:initialPlayers,games:initialGames,awards:initialAwards,seasons:initialSeasons});
  };

  const filtered=useMemo(()=>players.filter(p => `${p.name} ${p.nickname}`.toLowerCase().includes(search.toLowerCase())),[search]);
  const ranked=useMemo(()=>[...players].sort((a,b)=>b[leaderKey]-a[leaderKey]),[leaderKey]);
  const pointsLeader=[...players].sort((a,b)=>b.pts-a.pts)[0];
  const reboundsLeader=[...players].sort((a,b)=>b.reb-a.reb)[0];
  const assistsLeader=[...players].sort((a,b)=>b.ast-a.ast)[0];
  const winLeader=[...players].sort((a,b)=>pct(b)-pct(a))[0];
  const standings=useMemo(()=>teamStandings(games),[games]);
  const finalGames=useMemo(()=>games.filter(isFinal),[games]);
  const scheduledGames=useMemo(()=>games.filter(game=>!isFinal(game)),[games]);
  const latestFinal=finalGames[finalGames.length-1];
  const nextGame=scheduledGames[0];
  const hallOfFame=useMemo(()=>players.filter(p=>p.awards.length>0||legacyPercentage(p)>=60).sort((a,b)=>legacyPercentage(b)-legacyPercentage(a)),[players]);
  const records:RecordItem[]=useMemo(()=>[
    {category:"Career",label:"Most Points",holder:pointsLeader?.name??"—",value:String(pointsLeader?.pts??0),date:"Live shared totals"},
    {category:"Career",label:"Most Rebounds",holder:reboundsLeader?.name??"—",value:String(reboundsLeader?.reb??0),date:"Live shared totals"},
    {category:"Career",label:"Most Assists",holder:assistsLeader?.name??"—",value:String(assistsLeader?.ast??0),date:"Live shared totals"},
    {category:"Career",label:"Best Win Percentage",holder:winLeader?.name??"—",value:`${pct(winLeader)}%`,date:"Minimum one recorded game"},
    {category:"Team",label:"Best Record",holder:standings[0]?.team??"—",value:standings[0]?`${standings[0].wins}–${standings[0].losses}`:"0–0",date:"Calculated from Game History"},
    {category:"League",label:"Closest Game",holder:[...finalGames].sort((a,b)=>Math.abs(a.scoreA-a.scoreB)-Math.abs(b.scoreA-b.scoreB))[0]?.title??"—",value:finalGames.length?`${Math.min(...finalGames.map(g=>Math.abs(g.scoreA-g.scoreB)))} points`:"—",date:"Calculated automatically"},
  ],[players,finalGames,standings,pointsLeader,reboundsLeader,assistsLeader,winLeader]);

  const go=(next:View)=>{ setView(next); window.scrollTo({top:0,behavior:"smooth"}); };
  const openProfile=(player:Player)=>{setSelected(player);go("profile");};
  const shareLeague=async()=>{
    const share={title:"Y's Guys League",text:"Check out the official Y's Guys standings, stats and game history.",url:window.location.origin};
    try{if(navigator.share)await navigator.share(share);else{await navigator.clipboard.writeText(window.location.origin);setToast("League link copied");setTimeout(()=>setToast(""),1800)}}catch{}
  };

  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/league",{signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error();return response.json()}).then(result=>{
      if(result.data){
        const data=result.data as LeagueData;
        setPlayers(data.players);setGames(data.games);setAwards(data.awards);setSeasons(data.seasons);
        localStorage.setItem("yg-players",JSON.stringify(data.players));localStorage.setItem("yg-games",JSON.stringify(data.games));localStorage.setItem("yg-awards",JSON.stringify(data.awards));localStorage.setItem("yg-seasons",JSON.stringify(data.seasons));
      }
      setCloudUpdatedAt(result.updatedAt);setCloudStatus("cloud");
    }).catch(error=>{if(error?.name!=="AbortError")setCloudStatus("local")});
    return ()=>controller.abort();
  },[]);

  return <div className="app"><style>{styles}</style>
    <header className="topbar">
      <button className="brand" onClick={()=>go("home")}><span className="ball">YG</span><span><b>Y'S GUYS</b><small>League Universe · v3.1</small></span></button>
      <button className="seasonPill" onClick={()=>go("seasons")}><span className={`syncDot ${cloudStatus}`}/>{cloudStatus==="cloud"?"Shared":"Offline"} · Summer 2026</button>
    </header>

    <main>
      {view==="home" && <>
        <section className="hero">
          <div><span className="live"><i/>SEASON ACTIVE · CLOUD SYNC</span><h1>The official home of Y's Guys.</h1><p>Every player, game, award and record—preserved in one shared place.</p><div className="heroActions"><button onClick={()=>go("games")}>View latest game</button><button className="ghost" onClick={()=>go("records")}>Open record book</button><button className="ghost" onClick={shareLeague}>Share league</button></div></div>
          <div className="heroScore">{nextGame?<><small>NEXT GAME</small><b>{nextGame.startTime||"TBD"}</b><span>{nextGame.teamA} vs {nextGame.teamB}<br/>{nextGame.date}{nextGame.location?` · ${nextGame.location}`:""}</span></>:latestFinal?<><small>LATEST FINAL</small><b>{latestFinal.scoreA}–{latestFinal.scoreB}</b><span>{latestFinal.scoreA>latestFinal.scoreB?latestFinal.teamA:latestFinal.teamB} over {latestFinal.scoreA>latestFinal.scoreB?latestFinal.teamB:latestFinal.teamA}</span></>:<><small>GAME DAY</small><b>—</b><span>No games recorded yet</span></>}</div>
        </section>

        <Section title="League leaders" eyebrow="AT A GLANCE" action="View all" onAction={()=>go("leaders")}/>
        <div className="leaderGrid">
          <LeaderCard label="Points" player={pointsLeader} value={pointsLeader.pts} suffix="PTS" />
          <LeaderCard label="Rebounds" player={reboundsLeader} value={reboundsLeader.reb} suffix="REB" />
          <LeaderCard label="Assists" player={assistsLeader} value={assistsLeader.ast} suffix="AST" />
          <LeaderCard label="Best record" player={winLeader} value={`${winLeader.wins}-${winLeader.losses}`} suffix={`${pct(winLeader)}%`} />
        </div>

        <div className="twoCol">
          <section className="panel newsPanel"><Section title="League news" eyebrow="HEADLINES" />
            <article className="featureNews"><span>GAME RECAP</span><h3>Paul closes the door in a Week 2 thriller</h3><p>Cream survived Navy 66–63 in the closest game of the season.</p><button onClick={()=>go("games")}>Read recap →</button></article>
            <article className="newsRow"><b>Record watch</b><span>Vic leads the scoring race with 73 points.</span></article>
            <article className="newsRow"><b>Award spotlight</b><span>Paul's 2025 MVP now appears on his player profile.</span></article>
          </section>
          <section className="panel"><Section title="MVP ladder" eyebrow="POWER RANKINGS" />
            {[...players].sort((a,b)=>(b.wins*2+b.pts+b.ast)-(a.wins*2+a.pts+a.ast)).slice(0,5).map((p,i)=><button className="rankRow" key={p.id} onClick={()=>openProfile(p)}><span className="rank">{i+1}</span><span className="avatar">{initials(p.name)}</span><span className="grow"><b>{p.name}</b><small>{p.wins}-{p.losses} · {avg(p.pts,p)} PPG</small></span><strong>{overallRating(p)} OVR</strong></button>)}
          </section>
        </div>

        <Section title="Explore the league" eyebrow="LEAGUE ARCHIVE" />
        <div className="exploreGrid">
          <Explore icon="🏆" title="Record Book" copy="Career, team and league records." onClick={()=>go("records")}/>
          <Explore icon="🥇" title="Awards Center" copy="Every winner, every season." onClick={()=>go("awards")}/>
          <Explore icon="👤" title="Player Profiles" copy="Stats, bios, awards and legacy." onClick={()=>go("players")}/>
          <Explore icon="📅" title="Game History" copy="Scores, recaps and MVPs." onClick={()=>go("games")}/>
          <Explore icon="📊" title="Standings" copy="Team records, scoring and point differential." onClick={()=>go("standings")}/>
        </div>
      </>}

      {view==="games" && <Page eyebrow="GAME DAY · v2.8" title="Schedule and results." subtitle="Upcoming matchups and complete results from the active season.">
        {scheduledGames.length>0&&<><Section eyebrow="UP NEXT" title="Upcoming games"/><div className="upcomingList">{scheduledGames.map(g=><article className="upcomingCard" key={g.id}><div><span>{g.date}{g.startTime?` · ${g.startTime}`:""}</span><h3>{g.teamA} <em>vs</em> {g.teamB}</h3><p>{g.title}{g.location?` · ${g.location}`:""}</p></div><b>SCHEDULED</b></article>)}</div></>}
        <Section eyebrow="FINAL SCORES" title="Game history"/>
        <div className="gameList">{finalGames.map((g,i)=><article className="gameCard" key={g.id}><div className="gameTop"><span>{g.date}{g.location?` · ${g.location}`:""}</span><b>{i===finalGames.length-1?"LATEST":"FINAL"}</b></div><h3>{g.title}</h3><div className={g.scoreA<g.scoreB?"scoreLine loser":"scoreLine"}><span>{g.teamA}</span><strong>{g.scoreA}</strong></div><div className={g.scoreB<g.scoreA?"scoreLine loser":"scoreLine"}><span>{g.teamB}</span><strong>{g.scoreB}</strong></div>{g.mvp&&<div className="mvp">⭐ Player of the Game: <b>{g.mvp}</b></div>}<p>{g.recap}</p>{g.boxScore?.length?<details className="boxScorePublic"><summary>Open box score</summary><div className="publicStatHead"><b>Player</b><span>PTS</span><span>REB</span><span>AST</span><span>TO</span></div>{g.boxScore.map(line=><div className="publicStatRow" key={line.playerId}><b>{players.find(p=>p.id===line.playerId)?.name??"Player"}</b><span>{line.pts}</span><span>{line.reb}</span><span>{line.ast}</span><span>{line.turnovers}</span></div>)}</details>:null}</article>)}</div>
      </Page>}

      {view==="players" && <Page eyebrow="PLAYER DIRECTORY" title="The people who built the league." subtitle="Search the roster and open any profile.">
        <input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search players or nicknames…" />
        <div className="playerGrid">{filtered.map(p=><button className="playerCard" key={p.id} onClick={()=>openProfile(p)}>{p.photoUrl?<img className="playerThumb" src={p.photoUrl} alt={`${p.name} profile`}/>:<span className="bigAvatar">{overallRating(p)}</span>}<span className="pos">{p.jerseyNumber?`#${p.jerseyNumber} · `:""}{p.position}</span><h3>{p.name}</h3><small>“{p.nickname}” · {archetype(p)}</small><div className="miniStats"><span><b>{avg(p.pts,p)}</b>PPG</span><span><b>{avg(p.reb,p)}</b>RPG</span><span><b>{avg(p.ast,p)}</b>APG</span></div><div className="record">{p.wins}-{p.losses} · Legacy {legacyPercentage(p)}%</div></button>)}</div>
      </Page>}

      {view==="profile" && selected && <PlayerUniverseProfile player={selected} games={games} officialAwards={awards} rank={players.slice().sort((a,b)=>overallRating(b)-overallRating(a)).findIndex(p=>p.id===selected.id)+1} onBack={()=>go("players")}/>}

      {view==="compare" && <PlayerComparison players={players}/>}

      {view==="leaders" && <Page eyebrow="LEAGUE LEADERS" title="See who sets the pace." subtitle="Current totals through July 26, 2026.">
        <div className="chips">{([['pts','PTS'],['reb','REB'],['ast','AST'],['wins','WINS']] as const).map(([k,l])=><button className={leaderKey===k?"active":""} onClick={()=>setLeaderKey(k)} key={k}>{l}</button>)}</div>
        <section className="chart"><ResponsiveContainer width="100%" height={420}><BarChart data={ranked} layout="vertical" margin={{left:10,right:24}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" hide/><YAxis type="category" dataKey="name" width={76} tick={{fontSize:12,fontWeight:700,fill:NAVY}} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey={leaderKey} fill={NAVY} radius={[0,8,8,0]}/></BarChart></ResponsiveContainer></section>
      </Page>}

      {view==="records" && <Page eyebrow="THE ARCHIVE" title="Y's Guys Record Book" subtitle="The marks everyone is chasing.">
        <div className="recordHero"><span>🏆</span><div><small>LIVE FEATURED RECORD</small><h2>{winLeader.name} · Best Win Percentage</h2><p>{pct(winLeader)}% across {gp(winLeader)} games</p></div></div>
        <div className="recordGrid">{records.map((r,i)=><article className="recordCard" key={i}><span>{r.category}</span><h3>{r.label}</h3><strong>{r.value}</strong><b>{r.holder}</b><small>{r.date}</small></article>)}</div>
        <div className="note">Version 2.6 recalculates this record book whenever shared player or game data changes.</div>
      </Page>}

      {view==="awards" && <Page eyebrow="TROPHY ROOM" title="Awards Center" subtitle="Celebrating the players who shaped each season.">
        <div className="awardBanner"><div>2025</div><span>OFFICIAL AWARD CLASS</span></div>
        <div className="awardGrid">{awards.map(a=><article className="awardCard" key={a.name}><span>{a.icon}</span><small>{a.season}</small><h3>{a.name}</h3><b>{a.winner}</b></article>)}</div>
      </Page>}

      {view==="seasons" && <Page eyebrow="SEASON ARCHIVE" title="Choose an era." subtitle="Every season will keep its own games, leaders, awards and champion.">
        <div className="seasonList">{seasons.map(s=><article className="seasonCard" key={s.name}><div><span className={s.status==="Active"?"status active":"status"}>{s.status}</span><h3>{s.name}</h3><p>{s.games} recorded games · Champion: {s.champion}</p></div><button onClick={()=>go("home")}>Open →</button></article>)}</div>
      </Page>}

      {view==="standings" && <Page eyebrow="TEAM CENTER · v2.5" title="Standings" subtitle="Records and point differential calculated automatically from Game History.">
        <section className="standingsTable"><div className="standingsHead"><span>#</span><b>Team</b><span>W</span><span>L</span><span>PF</span><span>PA</span><span>DIFF</span></div>{standings.map((team,i)=><div className="standingsRow" key={team.team}><span>{i+1}</span><b>{team.team}</b><span>{team.wins}</span><span>{team.losses}</span><span>{team.pf}</span><span>{team.pa}</span><strong>{team.pf-team.pa>0?"+":""}{team.pf-team.pa}</strong></div>)}</section>
      </Page>}

      {view==="calendar" && <CalendarView games={games}/>}

      {view==="rules" && <RuleBook/>}

      {view==="hof" && <Page eyebrow="LEGACY WING · v2.6" title="Hall of Fame" subtitle="Award winners and players who cross the evolving legacy threshold.">
        <div className="hallGrid">{hallOfFame.map(p=><button className="hallCard" key={p.id} onClick={()=>openProfile(p)}><span>🏛️</span><small>{p.awards.length} RECORDED HONORS</small><h3>{p.name}</h3><p>{archetype(p)}</p><b>Legacy {legacyPercentage(p)}%</b></button>)}</div>
        <Section eyebrow="EVERY PLAYER" title="Legacy Tracker"/>
        <div className="legacyTracker">{players.slice().sort((a,b)=>legacyPercentage(b)-legacyPercentage(a)).map((p,index)=><button key={p.id} onClick={()=>openProfile(p)}><span>{index+1}</span><div><b>{p.name}</b><small>{archetype(p)} · {p.awards.length} honors</small><i><em style={{width:`${legacyPercentage(p)}%`}}/></i></div><strong>{legacyPercentage(p)}%</strong></button>)}</div>
      </Page>}

      {view==="commissioner" && <Page eyebrow="COMMISSIONER MODE · v2.7" title="Run the league without editing code." subtitle="Authenticated changes sync to every visitor through the shared league database.">
        {!sessionToken?<CommissionerLogin onLogin={(token)=>{sessionStorage.setItem("yg-session",token);setSessionToken(token);setCloudStatus("saving");fetch("/api/league",{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({data:{players,games,awards,seasons}})}).then(async response=>{if(!response.ok)throw new Error();const result=await response.json();setCloudUpdatedAt(result.updatedAt);setCloudStatus("cloud");setToast("Commissioner unlocked · league published");}).catch(()=>{setCloudStatus("error");setToast("Unlocked · first cloud save needs retry");}).finally(()=>setTimeout(()=>setToast(""),2400))}}/>:<>
        <div className="commissionerStatus"><div><span className={`syncDot ${cloudStatus}`}/><b>{cloudStatus==="saving"?"Saving…":cloudStatus==="cloud"?"Cloud connected":"Cloud attention needed"}</b><small>{cloudUpdatedAt?`Last cloud update ${new Date(cloudUpdatedAt).toLocaleString()}`:"Ready to create the first shared revision"}</small></div><button onClick={()=>{sessionStorage.removeItem("yg-session");setSessionToken("")}}>Lock Commissioner Mode</button></div>
        <div className="adminTabs">
          {([['games','Games'],['players','Players'],['awards','Awards'],['data','Backups']] as const).map(([k,l])=><button key={k} className={adminTab===k?'active':''} onClick={()=>setAdminTab(k)}>{l}</button>)}
        </div>
        {adminTab==='games' && <GameManager games={games} players={players} onSave={(game,previous)=>{const nextGames=previous?games.map(g=>g.id===game.id?game:g):[...games,game];const nextPlayers=applyBoxScoreDelta(players,previous,game);setGames(nextGames);setPlayers(nextPlayers);saveAll({games:nextGames,players:nextPlayers});}} onDelete={(game)=>{const nextGames=games.filter(g=>g.id!==game.id);const nextPlayers=applyBoxScoreDelta(players,game,undefined);setGames(nextGames);setPlayers(nextPlayers);saveAll({games:nextGames,players:nextPlayers});}}/>}
        {adminTab==='players' && <PlayerManager players={players} onChange={(next)=>{setPlayers(next);saveAll({players:next});}}/>}
        {adminTab==='awards' && <AwardManager awards={awards} players={players} onChange={(next)=>{setAwards(next);saveAll({awards:next});}}/>}
        {adminTab==='data' && <DataTools data={{players,games,awards,seasons}} sessionToken={sessionToken} onImport={replaceData} onCloudRestore={(data,updatedAt)=>{hydrateData(data);setCloudUpdatedAt(updatedAt);setCloudStatus("cloud");setToast("Cloud revision restored");setTimeout(()=>setToast(""),2000)}} onReset={resetData}/>}
        </>}
      </Page>}

      {view==="more" && <Page eyebrow="LEAGUE UNIVERSE · v3.0" title="More from Y's Guys" subtitle="Every corner of the league in one connected universe."><div className="menuList"><Menu label="Player Profiles" icon="🎮" onClick={()=>go("players")}/><Menu label="Compare Players" icon="⚔️" onClick={()=>go("compare")}/><Menu label="League Calendar" icon="📅" onClick={()=>go("calendar")}/><Menu label="Rule Book" icon="📖" onClick={()=>go("rules")}/><Menu label="Standings" icon="📊" onClick={()=>go("standings")}/><Menu label="Record Book" icon="🏆" onClick={()=>go("records")}/><Menu label="Awards Center" icon="🥇" onClick={()=>go("awards")}/><Menu label="Season Archive" icon="🗂️" onClick={()=>go("seasons")}/><Menu label="Hall of Fame & Legacy" icon="🏛️" onClick={()=>go("hof")}/><Menu label="Share League" icon="↗️" onClick={shareLeague}/><Menu label="Commissioner Mode" icon="🔒" onClick={()=>go("commissioner")}/></div></Page>}
    </main>

    {toast && <div className="toast">✓ {toast}</div>}
    <nav className="bottomNav">
      <Nav label="Home" icon="⌂" active={view==="home"} onClick={()=>go("home")}/><Nav label="Games" icon="◉" active={view==="games"} onClick={()=>go("games")}/><Nav label="Profiles" icon="◎" active={["players","profile"].includes(view)} onClick={()=>go("players")}/><Nav label="Leaders" icon="↗" active={view==="leaders"} onClick={()=>go("leaders")}/><Nav label="More" icon="•••" active={["more","compare","records","awards","seasons","standings","calendar","rules","hof","commissioner"].includes(view)} onClick={()=>go("more")}/>
    </nav>

  </div>
}

function PlayerUniverseProfile({player,games,officialAwards,rank,onBack}:{player:Player;games:Game[];officialAwards:Award[];rank:number;onBack:()=>void}){
  const honors=[...new Set([...player.awards,...officialAwards.filter(a=>a.winner.toLowerCase()===player.name.toLowerCase()).map(a=>`${a.season} ${a.name}`)])];
  const logs=games.filter(game=>game.boxScore?.some(line=>line.playerId===player.id)).map(game=>({game,line:game.boxScore!.find(line=>line.playerId===player.id)!}));
  const rating=overallRating(player),legacy=legacyPercentage(player);
  return <><button className="backButton" onClick={onBack}>← All profiles</button><section className="universeHero" style={player.bannerColor?{background:`linear-gradient(135deg,#071c3e,${player.bannerColor})`}:undefined}>{player.photoUrl?<div className="profilePhotoWrap"><img src={player.photoUrl} alt={`${player.name} profile`}/><b>{rating} OVR</b></div>:<div className="ratingOrb"><strong>{rating}</strong><small>OVR</small></div>}<div className="universeIdentity"><span>{player.jerseyNumber?`#${player.jerseyNumber} · `:""}{player.position}{player.height?` · ${player.height}`:""} · {archetype(player)}</span><h1>{player.name}</h1><p>“{player.nickname}”</p><div className="profileTags"><b>#{rank} OVERALL</b><b>{player.wins}-{player.losses} RECORD</b><b>{pct(player)}% WIN</b>{player.signatureBadge&&<b>⭐ {player.signatureBadge}</b>}</div></div><div className="legacyMeter"><div><strong>{legacy}%</strong><small>LEGACY</small></div><span><i style={{width:`${legacy}%`}}/></span><p>{legacy>=80?"Hall of Fame lock":legacy>=60?"Hall of Fame trajectory":legacy>=40?"Building a strong résumé":"Legacy journey underway"}</p></div></section>
  <div className="profileUniverseGrid"><section className="profilePanel"><Section eyebrow="PLAYER DNA" title="Attribute overview"/>{[["Scoring",Math.min(99,Math.round(60+avg(player.pts,player)*4))],["Rebounding",Math.min(99,Math.round(60+avg(player.reb,player)*4))],["Playmaking",Math.min(99,Math.round(60+avg(player.ast,player)*6))],["Winning",Math.min(99,Math.round(55+pct(player)*.44))]].map(([label,value])=><div className="attributeRow" key={label}><b>{label}</b><span><i style={{width:`${value}%`}}/></span><strong>{value}</strong></div>)}<p className="bio">{player.bio}</p></section>
  <section className="profilePanel"><Section eyebrow="TROPHY CASE" title="Awards & honors"/>{honors.length?honors.map(honor=><div className="profileHonor" key={honor}><span>🏆</span><b>{honor}</b></div>):<div className="empty">No official honors recorded yet.</div>}{player.strengths&&<><h4>Signature strengths</h4><p className="bio">{player.strengths}</p></>}</section></div>
  <section className="profilePanel badgePanel"><Section eyebrow="2K-STYLE IDENTITY" title="Player badges"/><div className="badgeGrid">{playerBadges(player).map(badge=><article className={`playerBadge ${badge.level.toLowerCase()}`} key={badge.name}><span>{badge.icon}</span><div><b>{badge.name}</b><small>{badge.level} badge</small></div></article>)}</div></section>
  <section className="profilePanel profileGameLog"><Section eyebrow="CAREER LOG" title="Recorded box scores"/>{logs.length?<><div className="logHead"><b>Game</b><span>PTS</span><span>REB</span><span>AST</span><span>TO</span></div>{logs.map(({game,line})=><div className="logRow" key={game.id}><div><b>{game.title}</b><small>{game.date} · {line.team}</small></div><span>{line.pts}</span><span>{line.reb}</span><span>{line.ast}</span><span>{line.turnovers}</span></div>)}</>:<div className="empty">Future Game Day box scores will appear here automatically.</div>}</section></>;
}

function PlayerComparison({players}:{players:Player[]}){
  const [leftId,setLeftId]=useState(players[0]?.id??"");
  const [rightId,setRightId]=useState(players[1]?.id??players[0]?.id??"");
  const left=players.find(p=>p.id===leftId)??players[0],right=players.find(p=>p.id===rightId)??players[1]??players[0];
  const rows=[
    ["Overall",overallRating(left),overallRating(right)],
    ["Legacy",legacyPercentage(left),legacyPercentage(right)],
    ["Win %",pct(left),pct(right)],
    ["PPG",avg(left.pts,left),avg(right.pts,right)],
    ["RPG",avg(left.reb,left),avg(right.reb,right)],
    ["APG",avg(left.ast,left),avg(right.ast,right)],
    ["Awards",left.awards.length,right.awards.length],
  ] as const;
  return <Page eyebrow="MATCHUP LAB · v3.0" title="Compare players." subtitle="Put any two résumés side by side and see where each player owns the edge."><div className="compareSelectors"><label>Player one<select value={leftId} onChange={e=>setLeftId(e.target.value)}>{players.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label><span>VS</span><label>Player two<select value={rightId} onChange={e=>setRightId(e.target.value)}>{players.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label></div><section className="compareHero"><CompareIdentity player={left}/><div className="versus">VS</div><CompareIdentity player={right}/></section><section className="comparisonTable"><div className="comparisonHead"><b>{left.name}</b><span>CATEGORY</span><b>{right.name}</b></div>{rows.map(([label,a,b])=><div className="comparisonRow" key={label}><strong className={a>b?"winner":""}>{a}{label==="Legacy"||label==="Win %"?"%":""}</strong><span>{label}</span><strong className={b>a?"winner":""}>{b}{label==="Legacy"||label==="Win %"?"%":""}</strong></div>)}</section></Page>;
}

function CompareIdentity({player}:{player:Player}){
  return <article className="compareIdentity"><div>{overallRating(player)}<small>OVR</small></div><span>{player.position} · {archetype(player)}</span><h2>{player.name}</h2><p>“{player.nickname}”</p><div className="miniBadgeRow">{playerBadges(player).slice(0,3).map(badge=><i title={badge.name} key={badge.name}>{badge.icon}</i>)}</div></article>;
}

function CalendarView({games}:{games:Game[]}){
  const first=games.map(game=>new Date(game.date)).find(date=>!Number.isNaN(date.getTime()))??new Date();
  const [month,setMonth]=useState(new Date(first.getFullYear(),first.getMonth(),1));
  const year=month.getFullYear(),monthIndex=month.getMonth(),days=new Date(year,monthIndex+1,0).getDate(),offset=new Date(year,monthIndex,1).getDay();
  const cells=Array.from({length:offset+days},(_,index)=>index<offset?null:index-offset+1);
  const gamesForDay=(day:number)=>games.filter(game=>{const date=new Date(game.date);return !Number.isNaN(date.getTime())&&date.getFullYear()===year&&date.getMonth()===monthIndex&&date.getDate()===day});
  return <Page eyebrow="LEAGUE CALENDAR · v2.9" title="The season at a glance." subtitle="Scheduled games and final results share one calendar."><div className="calendarControls"><button aria-label="Previous month" onClick={()=>setMonth(new Date(year,monthIndex-1,1))}>←</button><h2>{month.toLocaleString(undefined,{month:"long",year:"numeric"})}</h2><button aria-label="Next month" onClick={()=>setMonth(new Date(year,monthIndex+1,1))}>→</button></div><section className="calendar"><div className="weekday">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day=><b key={day}>{day}</b>)}</div><div className="calendarGrid">{cells.map((day,index)=><div className={day?"calendarDay":"calendarDay blank"} key={`${year}-${monthIndex}-${index}`}>{day&&<><span>{day}</span>{gamesForDay(day).map(game=><article className={isFinal(game)?"calendarGame final":"calendarGame"} key={game.id}><b>{game.teamA} {isFinal(game)?game.scoreA:""} {isFinal(game)?"–":"vs"} {game.teamB} {isFinal(game)?game.scoreB:""}</b><small>{game.startTime||game.title}</small></article>)}</>}</div>)}</div></section></Page>;
}

function RuleBook(){
  const sections=[
    {icon:"🏀",title:"Game Format",rules:["Teams are organized for competitive, balanced runs.","Official scores and results are published through Commissioner Mode.","A scheduled game does not affect standings until marked Final."]},
    {icon:"🔥",title:"Heat Check",rules:["The league may use the Heat Check bonus when announced before play.","A successful Heat Check is worth one additional point.","The rule must be applied consistently to both teams."]},
    {icon:"🗳️",title:"Voting & Awards",rules:["Players vote for weekly or seasonal MVP recognition.","Award votes should reflect performance, winning and sportsmanship.","The commissioner records official winners in the Awards Center."]},
    {icon:"🤝",title:"League Conduct",rules:["Compete hard while respecting teammates, opponents and the facility.","Settle disputed calls quickly and keep the game moving.","Dangerous or repeated unsportsmanlike play can lead to removal from a run."]},
    {icon:"📊",title:"Statistics",rules:["Only final games count toward standings and career totals.","Each player may have one official box-score line per game.","Editing or deleting a box score automatically reverses its old totals."]},
    {icon:"⚖️",title:"Commissioner Authority",rules:["The commissioner maintains schedules, results, rosters and corrections.","Major rule changes should be announced before they take effect.","Backups should be downloaded before major historical edits."]},
  ];
  return <Page eyebrow="OFFICIAL RULE BOOK · v2.9" title="How the Y's Guys universe operates." subtitle="A living foundation for fair competition, accurate history and a better weekly run."><div className="ruleHero"><span>YG</span><div><b>LEAGUE STANDARD</b><h2>Compete. Record. Respect the run.</h2></div></div><div className="rulesGrid">{sections.map((section,index)=><section className="ruleSection" key={section.title}><div><span>{section.icon}</span><small>ARTICLE {index+1}</small></div><h2>{section.title}</h2><ol>{section.rules.map(rule=><li key={rule}>{rule}</li>)}</ol></section>)}</div><div className="note">This digital rule book is the current league reference. Commissioner-controlled rule editing can be added in a future release.</div></Page>;
}

function GameManager({games,players,onSave,onDelete}:{games:Game[];players:Player[];onSave:(game:Game,previous?:Game)=>void;onDelete:(game:Game)=>void}){
  const empty:Game={id:"",date:"",startTime:"",location:"",status:"scheduled",title:"",teamA:"",scoreA:0,teamB:"",scoreB:0,mvp:"",recap:"",boxScore:[]};
  const [draft,setDraft]=useState<Game>(empty);
  const [original,setOriginal]=useState<Game|undefined>();
  const editing=Boolean(draft.id);
  const save=(e:React.FormEvent)=>{
    e.preventDefault();
    if(!draft.date.trim()||!draft.title.trim()||!draft.teamA.trim()||!draft.teamB.trim()) return alert("Date, game title and both team names are required.");
    if(draft.teamA.trim().toLowerCase()===draft.teamB.trim().toLowerCase()) return alert("The two team names must be different.");
    const playerIds=(draft.boxScore??[]).map(line=>line.playerId).filter(Boolean);
    if(new Set(playerIds).size!==playerIds.length)return alert("Each player can appear only once in a game box score.");
    if(isFinal(draft)&&draft.scoreA===draft.scoreB)return alert("A final game needs a winner. Scheduled games may remain scoreless.");
    if(!isFinal(draft)&&draft.boxScore?.length)return alert("Move the game to Final before adding official player statistics.");
    const clean={...draft,id:draft.id||makeId("game"),scoreA:Number(draft.scoreA),scoreB:Number(draft.scoreB)};
    onSave(clean,original);setDraft(empty);setOriginal(undefined);
  };
  const remove=(game:Game)=>{if(confirm("Delete this game and reverse its box-score totals?")){onDelete(game);setDraft(empty);setOriginal(undefined);}};
  const addLine=()=>setDraft({...draft,boxScore:[...(draft.boxScore??[]),{playerId:players[0]?.id??"",team:draft.teamA,pts:0,reb:0,ast:0,turnovers:0}]});
  const updateLine=(index:number,patch:Partial<StatLine>)=>setDraft({...draft,boxScore:(draft.boxScore??[]).map((line,i)=>i===index?{...line,...patch}:line)});
  return <div className="managerGrid"><form className="adminCard" onSubmit={save}><h2>{editing?"Edit game":"Add a game"}</h2><p>Scores and recaps appear in Game History immediately.</p><div className="formGrid">
    <label>Date<input required value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})} placeholder="July 30, 2026"/></label>
    <label>Status<select value={draft.status??"final"} onChange={e=>setDraft({...draft,status:e.target.value as GameStatus})}><option value="scheduled">Scheduled</option><option value="final">Final</option></select></label>
    <label>Start time<input value={draft.startTime??""} onChange={e=>setDraft({...draft,startTime:e.target.value})} placeholder="7:00 PM"/></label>
    <label>Location<input value={draft.location??""} onChange={e=>setDraft({...draft,location:e.target.value})} placeholder="Highland YMCA"/></label>
    <label>Game title<input required value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="Summer League Week 3"/></label>
    <label>Team A<input required value={draft.teamA} onChange={e=>setDraft({...draft,teamA:e.target.value})}/></label>
    <label>Team A score<input min="0" type="number" value={draft.scoreA} onChange={e=>setDraft({...draft,scoreA:Number(e.target.value)})}/></label>
    <label>Team B<input required value={draft.teamB} onChange={e=>setDraft({...draft,teamB:e.target.value})}/></label>
    <label>Team B score<input min="0" type="number" value={draft.scoreB} onChange={e=>setDraft({...draft,scoreB:Number(e.target.value)})}/></label>
    <label className="wide">Player of the game<select value={draft.mvp} onChange={e=>setDraft({...draft,mvp:e.target.value})}><option value="">Select a player</option>{players.map(p=><option key={p.id}>{p.name}</option>)}</select></label>
    <label className="wide">Recap<textarea value={draft.recap} onChange={e=>setDraft({...draft,recap:e.target.value})} placeholder="What decided the game?"/></label>
  </div>{isFinal(draft)&&<div className="boxScoreEditor"><div className="boxScoreTitle"><div><b>Player box score</b><small>These entries automatically adjust career totals and records.</small></div><button type="button" onClick={addLine}>+ Add player line</button></div>{(draft.boxScore??[]).map((line,index)=><div className="statLineEdit" key={`${line.playerId}-${index}`}><select value={line.playerId} onChange={e=>updateLine(index,{playerId:e.target.value})}>{players.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select><select value={line.team} onChange={e=>updateLine(index,{team:e.target.value})}><option>{draft.teamA||"Team A"}</option><option>{draft.teamB||"Team B"}</option></select>{(["pts","reb","ast","turnovers"] as const).map(key=><label key={key}>{key==="turnovers"?"TO":key.toUpperCase()}<input type="number" min="0" value={line[key]} onChange={e=>updateLine(index,{[key]:Number(e.target.value)})}/></label>)}<button className="deleteLink" type="button" onClick={()=>setDraft({...draft,boxScore:(draft.boxScore??[]).filter((_,i)=>i!==index)})}>×</button></div>)}</div>}<div className="formActions"><button className="primary" type="submit">{editing?"Save changes":"Add game"}</button>{editing&&<button className="secondary" type="button" onClick={()=>{setDraft(empty);setOriginal(undefined)}}>Cancel</button>}</div></form>
  <ManageList title="Recorded games" empty="No games recorded yet.">{games.map(g=><div className="manageRow" key={g.id}><div><b>{g.title}</b><small>{g.date} · {g.teamA} {g.scoreA}–{g.scoreB} {g.teamB} · {g.boxScore?.length??0} stat lines</small></div><button onClick={()=>{setDraft({...g,boxScore:(g.boxScore??[]).map(line=>({...line}))});setOriginal(g)}}>Edit</button><button className="deleteLink" onClick={()=>remove(g)}>Delete</button></div>)}</ManageList></div>;
}

function PlayerManager({players,onChange}:{players:Player[];onChange:(players:Player[])=>void}){
  const empty:Player={id:"",name:"",nickname:"",position:"G",wins:0,losses:0,pts:0,reb:0,ast:0,turnovers:0,awards:[],bio:"",jerseyNumber:"",height:"",strengths:"",signatureBadge:"",photoUrl:"",bannerColor:"#0A2D5E"};
  const [draft,setDraft]=useState<Player>(empty);
  const editing=Boolean(draft.id);
  const save=(e:React.FormEvent)=>{
    e.preventDefault();
    if(!draft.name.trim()) return alert("Player name is required.");
    if(!editing&&players.some(p=>p.name.toLowerCase()===draft.name.trim().toLowerCase())) return alert("A player with that name already exists.");
    const clean={...draft,id:draft.id||makeId("player"),name:draft.name.trim(),nickname:draft.nickname.trim(),awards:draft.awards.filter(Boolean)};
    onChange(editing?players.map(p=>p.id===clean.id?clean:p):[...players,clean]);setDraft(empty);
  };
  const numberField=(label:keyof Pick<Player,"wins"|"losses"|"pts"|"reb"|"ast"|"turnovers">)=><label>{label[0].toUpperCase()+label.slice(1)}<input min="0" type="number" value={draft[label]} onChange={e=>setDraft({...draft,[label]:Number(e.target.value)})}/></label>;
  const remove=(id:string)=>{if(confirm("Delete this player? Existing game and award names will remain as historical text.")){onChange(players.filter(p=>p.id!==id));setDraft(empty);}};
  return <div className="managerGrid"><form className="adminCard" onSubmit={save}><h2>{editing?"Edit player":"Add a player"}</h2><p>Correct totals, profile details and awards without resetting the league.</p><div className="formGrid">
    <label>Name<input required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
    <label>Nickname<input value={draft.nickname} onChange={e=>setDraft({...draft,nickname:e.target.value})}/></label>
    <label>Position<select value={draft.position} onChange={e=>setDraft({...draft,position:e.target.value})}>{["G","F","C","PG","SG","SF","PF"].map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Jersey number<input value={draft.jerseyNumber??""} onChange={e=>setDraft({...draft,jerseyNumber:e.target.value})} placeholder="23"/></label>
    <label>Height<input value={draft.height??""} onChange={e=>setDraft({...draft,height:e.target.value})} placeholder="6'1&quot;"/></label>
    <label>Signature badge<input value={draft.signatureBadge??""} onChange={e=>setDraft({...draft,signatureBadge:e.target.value})} placeholder="Acrobat Finisher"/></label>
    <label>Banner color<input type="color" value={draft.bannerColor??"#0A2D5E"} onChange={e=>setDraft({...draft,bannerColor:e.target.value})}/></label>
    {numberField("wins")}{numberField("losses")}{numberField("pts")}{numberField("reb")}{numberField("ast")}{numberField("turnovers")}
    <label className="wide">Awards, separated by commas<input value={draft.awards.join(", ")} onChange={e=>setDraft({...draft,awards:e.target.value.split(",").map(x=>x.trim())})}/></label>
    <label className="wide">Profile photo URL<input type="url" value={draft.photoUrl??""} onChange={e=>setDraft({...draft,photoUrl:e.target.value})} placeholder="https://…"/></label>
    <label className="wide">Strengths<textarea value={draft.strengths??""} onChange={e=>setDraft({...draft,strengths:e.target.value})} placeholder="On-ball defense, transition finishing, rebounding…"/></label>
    <label className="wide">Bio<textarea value={draft.bio} onChange={e=>setDraft({...draft,bio:e.target.value})}/></label>
  </div><div className="formActions"><button className="primary" type="submit">{editing?"Save changes":"Add player"}</button>{editing&&<button className="secondary" type="button" onClick={()=>setDraft(empty)}>Cancel</button>}</div></form>
  <ManageList title="Current roster" empty="No players yet.">{players.map(p=><div className="manageRow" key={p.id}><div><b>{p.name}</b><small>{p.position} · {p.wins}-{p.losses} · {p.pts} PTS</small></div><button onClick={()=>setDraft({...p,awards:[...p.awards]})}>Edit</button><button className="deleteLink" onClick={()=>remove(p.id)}>Delete</button></div>)}</ManageList></div>;
}

function AwardManager({awards,players,onChange}:{awards:Award[];players:Player[];onChange:(awards:Award[])=>void}){
  const empty:Award={season:"2026",name:"",winner:players[0]?.name??"",icon:"🏆"};
  const [draft,setDraft]=useState<Award>(empty);
  const [editIndex,setEditIndex]=useState<number|null>(null);
  const save=(e:React.FormEvent)=>{e.preventDefault();if(!draft.name.trim()||!draft.winner.trim())return alert("Award name and winner are required.");const next=editIndex===null?[...awards,draft]:awards.map((a,i)=>i===editIndex?draft:a);onChange(next);setDraft(empty);setEditIndex(null);};
  const remove=(index:number)=>{if(confirm("Delete this award?"))onChange(awards.filter((_,i)=>i!==index));};
  return <div className="managerGrid"><form className="adminCard" onSubmit={save}><h2>{editIndex===null?"Add an award":"Edit award"}</h2><p>Maintain the official trophy room.</p><div className="formGrid">
    <label>Season<input required value={draft.season} onChange={e=>setDraft({...draft,season:e.target.value})}/></label>
    <label>Icon<input value={draft.icon} onChange={e=>setDraft({...draft,icon:e.target.value})}/></label>
    <label className="wide">Award name<input required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
    <label className="wide">Winner<select value={draft.winner} onChange={e=>setDraft({...draft,winner:e.target.value})}><option value="">Select a player</option>{players.map(p=><option key={p.id}>{p.name}</option>)}</select></label>
  </div><div className="formActions"><button className="primary" type="submit">{editIndex===null?"Add award":"Save changes"}</button>{editIndex!==null&&<button className="secondary" type="button" onClick={()=>{setDraft(empty);setEditIndex(null)}}>Cancel</button>}</div></form>
  <ManageList title="Award history" empty="No awards yet.">{awards.map((a,i)=><div className="manageRow" key={`${a.season}-${a.name}-${i}`}><div><b>{a.icon} {a.name}</b><small>{a.season} · {a.winner}</small></div><button onClick={()=>{setDraft(a);setEditIndex(i)}}>Edit</button><button className="deleteLink" onClick={()=>remove(i)}>Delete</button></div>)}</ManageList></div>;
}

function DataTools({data,sessionToken,onImport,onCloudRestore,onReset}:{data:LeagueData;sessionToken:string;onImport:(data:LeagueData)=>void;onCloudRestore:(data:LeagueData,updatedAt:string)=>void;onReset:()=>void}){
  const [history,setHistory]=useState<{revision:number;createdAt:string}[]>([]);
  const [historyStatus,setHistoryStatus]=useState("");
  const importFile=(event:React.ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{try{const parsed=JSON.parse(String(reader.result));if(!Array.isArray(parsed.players)||!Array.isArray(parsed.games)||!Array.isArray(parsed.awards)||!Array.isArray(parsed.seasons))throw new Error();if(confirm("Replace this device's league data with the selected backup?"))onImport({players:parsed.players,games:parsed.games,awards:parsed.awards,seasons:parsed.seasons});}catch{alert("That file is not a valid Y's Guys backup.");}};
    reader.readAsText(file);event.target.value="";
  };
  const loadHistory=async()=>{setHistoryStatus("Loading…");try{const response=await fetch("/api/league?history=1",{headers:{Authorization:`Bearer ${sessionToken}`}});if(!response.ok)throw new Error();const result=await response.json();setHistory(result.history);setHistoryStatus(result.history.length?"":"No cloud revisions yet.");}catch{setHistoryStatus("Could not load restore points.");}};
  const restore=async(revision:number)=>{if(!confirm(`Restore cloud revision ${revision}? The current state will remain available as a newer restore point.`))return;setHistoryStatus("Restoring…");try{const response=await fetch("/api/league",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${sessionToken}`},body:JSON.stringify({revision})});if(!response.ok)throw new Error();const result=await response.json();onCloudRestore(result.data,result.updatedAt);await loadHistory();}catch{setHistoryStatus("Restore failed. Current data was not changed.");}};
  return <section className="adminCard"><h2>Backups & recovery</h2><p>Export before major changes. Automatic cloud restore points now protect every successful shared save.</p><div className="dataActions"><button className="primary" onClick={()=>exportData(data)}>Download backup</button><label className="uploadButton">Import backup<input type="file" accept="application/json" onChange={importFile}/></label><button className="secondary" onClick={loadHistory}>Cloud restore points</button><button className="danger" onClick={onReset}>Restore original data</button></div>{historyStatus&&<p className="historyStatus">{historyStatus}</p>}{history.length>0&&<div className="historyList">{history.map(item=><div key={item.revision}><span><b>Revision {item.revision}</b><small>{new Date(item.createdAt).toLocaleString()}</small></span><button onClick={()=>restore(item.revision)}>Restore</button></div>)}</div>}<div className="securityNote"><b>Protected shared storage</b><span>Every successful Commissioner save creates an automatic cloud restore point. Downloaded JSON backups remain the safest off-platform copy.</span></div></section>;
}

function CommissionerLogin({onLogin}:{onLogin:(token:string)=>void}){
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();setLoading(true);setError("");
    try{
      const response=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password})});
      if(!response.ok)throw new Error();
      const result=await response.json();onLogin(result.token);setPassword("");
    }catch{setError("That password did not unlock Commissioner Mode.");}
    finally{setLoading(false);}
  };
  return <form className="adminCard loginCard" onSubmit={submit}><span className="lockIcon">🔐</span><h2>Commissioner sign in</h2><p>Public visitors can view the league. Only the commissioner can publish changes.</p><label>Password<input autoComplete="current-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} required/></label>{error&&<div className="formError">{error}</div>}<button className="primary" disabled={loading}>{loading?"Checking…":"Unlock Commissioner Mode"}</button></form>;
}

function ManageList({title,empty,children}:{title:string;empty:string;children:React.ReactNode}){
  const count=React.Children.count(children);
  return <section className="adminCard manageList"><h2>{title}</h2><p>{count} {count===1?"record":"records"}</p>{count?children:<div className="empty">{empty}</div>}</section>;
}

function Section({eyebrow,title,action,onAction}:{eyebrow:string,title:string,action?:string,onAction?:()=>void}){return <div className="sectionTitle"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action&&<button onClick={onAction}>{action}</button>}</div>}
function LeaderCard({label,player,value,suffix}:{label:string,player:Player,value:string|number,suffix:string}){return <article className="leaderCard"><small>{label}</small><div><span className="avatar">{initials(player.name)}</span><b>{player.name}</b></div><strong>{value}</strong><em>{suffix}</em></article>}
function Explore({icon,title,copy,onClick}:{icon:string,title:string,copy:string,onClick:()=>void}){return <button className="explore" onClick={onClick}><span>{icon}</span><div><b>{title}</b><small>{copy}</small></div><i>→</i></button>}
function Page({eyebrow,title,subtitle,children}:{eyebrow:string,title:string,subtitle:string,children:React.ReactNode}){return <><header className="pageHead"><span>{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></header>{children}</>}
function Menu({label,icon,onClick,badge}:{label:string,icon:string,onClick?:()=>void,badge?:string}){return <button className="menuItem" onClick={onClick} disabled={!onClick}><span>{icon}</span><b>{label}</b>{badge?<small>{badge}</small>:<i>→</i>}</button>}
function Nav({label,icon,active,onClick}:{label:string,icon:string,active:boolean,onClick:()=>void}){return <button className={active?"active":""} onClick={onClick}><span>{icon}</span><small>{label}</small></button>}

const styles = `
*{box-sizing:border-box}body{margin:0;background:#f3f5f8;color:${NAVY};font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.app{min-height:100vh}.topbar{height:76px;position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:0 max(20px,calc((100vw - 1180px)/2));background:rgba(255,255,255,.94);backdrop-filter:blur(16px);border-bottom:1px solid #e7eaf0}.brand{display:flex;align-items:center;gap:12px;border:0;background:none;color:${NAVY};text-align:left}.brand .ball{width:42px;height:42px;border-radius:14px;background:${NAVY};color:white;display:grid;place-items:center;font-weight:900}.brand b{display:block;letter-spacing:.08em}.brand small{display:block;color:#6c7890;margin-top:2px}.seasonPill{border:1px solid #dbe0e8;background:white;padding:10px 14px;border-radius:999px;color:${NAVY};font-weight:800;display:flex;align-items:center;gap:7px}.syncDot{width:8px;height:8px;border-radius:50%;display:inline-block;background:#9ca7b5}.syncDot.cloud{background:#2eb66d}.syncDot.saving,.syncDot.loading{background:#d2a52d}.syncDot.error{background:#d64f4f}.commissionerStatus{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:15px 18px;margin-bottom:16px;background:#e8f5ed;border:1px solid #c9e8d5;border-radius:17px}.commissionerStatus>div{display:grid;grid-template-columns:auto 1fr;align-items:center;gap:4px 9px}.commissionerStatus small{grid-column:2;color:#60766a}.commissionerStatus button{border:0;background:white;color:${NAVY};border-radius:10px;padding:10px 12px;font-weight:800}.loginCard{max-width:520px;margin:0 auto}.loginCard .lockIcon{font-size:40px}.loginCard label{display:flex;flex-direction:column;gap:7px;font-size:12px;font-weight:900}.loginCard input{padding:14px;border:1px solid #dbe1e9;border-radius:12px;font:inherit}.formError{margin-top:12px;color:#a62e2e;background:#fff0f0;padding:10px 12px;border-radius:10px}main{max-width:1180px;margin:auto;padding:28px 20px 110px}.hero{background:linear-gradient(135deg,#081f43,${NAVY} 60%,#144b85);color:white;border-radius:30px;padding:38px;display:grid;grid-template-columns:1.5fr .7fr;gap:28px;box-shadow:0 22px 50px rgba(10,45,94,.22);overflow:hidden;position:relative}.hero:after{content:"";position:absolute;width:320px;height:320px;border-radius:50%;background:rgba(199,162,77,.12);right:-100px;top:-120px}.live{font-size:11px;font-weight:900;letter-spacing:.14em;background:rgba(255,255,255,.12);padding:8px 11px;border-radius:999px;display:inline-flex;gap:7px;align-items:center}.live i{width:7px;height:7px;border-radius:50%;background:#65df8b}.hero h1{font-size:clamp(34px,6vw,62px);line-height:.98;max-width:720px;margin:20px 0 14px}.hero p{font-size:18px;max-width:610px;color:#dfe8f4}.heroActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.heroActions button{border:0;background:${GOLD};color:#071f42;padding:13px 17px;border-radius:13px;font-weight:900}.heroActions .ghost{background:transparent;border:1px solid rgba(255,255,255,.35);color:white}.heroScore{align-self:center;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.09);border-radius:22px;padding:24px;display:flex;flex-direction:column;position:relative;z-index:1}.heroScore small{letter-spacing:.14em;font-weight:900}.heroScore b{font-size:48px;margin:8px 0}.heroScore span{color:#dce5f2}.sectionTitle{display:flex;align-items:end;justify-content:space-between;margin:34px 2px 16px}.sectionTitle span,.pageHead>span{font-size:11px;letter-spacing:.16em;font-weight:900;color:#9b7628}.sectionTitle h2{margin:4px 0 0;font-size:26px}.sectionTitle button{border:0;background:none;color:${NAVY};font-weight:900}.leaderGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.leaderCard,.panel,.chart,.gameCard,.playerCard,.recordCard,.awardCard,.seasonCard,.menuItem{background:white;border:1px solid #e6e9ef;box-shadow:0 10px 26px rgba(23,42,73,.06)}.leaderCard{border-radius:20px;padding:18px}.leaderCard>small{color:#778399;font-weight:800}.leaderCard>div{display:flex;align-items:center;gap:9px;margin:14px 0}.avatar{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:#edf1f7;color:${NAVY};font-size:12px;font-weight:900}.leaderCard>strong{font-size:31px}.leaderCard em{font-size:11px;font-style:normal;font-weight:900;margin-left:6px;color:#9b7628}.twoCol{display:grid;grid-template-columns:1.15fr .85fr;gap:18px}.panel{border-radius:24px;padding:0 20px 18px}.panel .sectionTitle{margin-top:20px}.featureNews{border-radius:18px;background:${NAVY};color:white;padding:22px}.featureNews span{font-size:10px;font-weight:900;letter-spacing:.15em;color:#e8c876}.featureNews h3{font-size:23px;margin:8px 0}.featureNews p{color:#dce5f0}.featureNews button{border:0;background:none;color:#e8c876;font-weight:900;padding:0}.newsRow{display:grid;grid-template-columns:125px 1fr;gap:12px;padding:15px 3px;border-bottom:1px solid #edf0f4;font-size:14px}.newsRow span{color:#6f7a8d}.rankRow{width:100%;display:flex;align-items:center;gap:10px;border:0;border-bottom:1px solid #edf0f4;background:none;padding:12px 0;color:${NAVY};text-align:left}.rank{font-weight:900;width:20px}.grow{display:flex;flex-direction:column;flex:1}.grow small{color:#7c8798;margin-top:2px}.exploreGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.explore{border:1px solid #e3e7ed;background:white;border-radius:20px;padding:20px;text-align:left;display:flex;align-items:center;gap:13px;color:${NAVY};box-shadow:0 10px 24px rgba(20,40,70,.05)}.explore>span{font-size:28px}.explore div{display:flex;flex-direction:column;flex:1}.explore small{color:#788397;margin-top:4px;line-height:1.35}.explore i{font-style:normal;font-weight:900}.pageHead{padding:22px 2px 24px}.pageHead h1{font-size:clamp(34px,6vw,56px);line-height:1;margin:8px 0 12px}.pageHead p{color:#6e798b;font-size:17px;margin:0}.gameList{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}.gameCard{border-radius:24px;padding:24px}.gameTop{display:flex;justify-content:space-between;color:#7b8698;font-size:12px}.gameTop b{color:#9b7628}.gameCard h3{font-size:22px}.scoreLine{display:flex;justify-content:space-between;font-size:20px;padding:11px 0;border-bottom:1px solid #edf0f4}.scoreLine strong{font-size:28px}.scoreLine.loser{color:#758197}.mvp{margin:16px 0 8px;padding:10px 12px;background:#f8f1df;border-radius:12px;font-size:13px}.gameCard p{color:#6d788b;line-height:1.55}.search{width:100%;padding:15px 17px;border-radius:15px;border:1px solid #dfe4eb;font-size:16px;margin-bottom:18px}.playerGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.playerCard{border-radius:22px;padding:20px;text-align:left;color:${NAVY};position:relative}.bigAvatar,.playerThumb{width:58px;height:58px;border-radius:18px}.bigAvatar{display:grid;place-items:center;background:${NAVY};color:white;font-weight:900;font-size:18px}.playerThumb{object-fit:cover;border:2px solid #e1c56f}.pos{position:absolute;right:16px;top:16px;background:#f1e7cc;color:#87671f;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:900}.playerCard h3{margin:14px 0 2px;font-size:20px}.playerCard>small{color:#7d8899}.miniStats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:16px 0}.miniStats span{background:#f5f7fa;border-radius:10px;padding:9px 4px;text-align:center;font-size:9px;font-weight:900;color:#8a94a4}.miniStats b{display:block;color:${NAVY};font-size:15px}.record{font-size:13px;font-weight:800}.chips{display:flex;gap:8px;overflow:auto;margin-bottom:16px}.chips button{border:1px solid #dfe4eb;background:white;color:${NAVY};font-weight:900;padding:10px 15px;border-radius:999px}.chips button.active{background:${NAVY};color:white}.chart{border-radius:24px;padding:20px}.recordHero{display:flex;align-items:center;gap:20px;background:linear-gradient(135deg,#f7edd1,#fff);border:1px solid #ead8a8;border-radius:25px;padding:24px;margin-bottom:18px}.recordHero>span{font-size:55px}.recordHero small{letter-spacing:.14em;font-weight:900;color:#9b7628}.recordHero h2{margin:5px 0}.recordHero p{margin:0;color:#776639}.recordGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.recordCard{border-radius:20px;padding:20px;display:flex;flex-direction:column}.recordCard>span{font-size:10px;letter-spacing:.12em;font-weight:900;color:#9b7628}.recordCard h3{margin:8px 0}.recordCard strong{font-size:30px}.recordCard b{margin:7px 0}.recordCard small{color:#7c8798}.note{margin-top:18px;background:#eaf0f7;border-radius:16px;padding:16px;color:#52637b;font-size:14px}.awardBanner{height:150px;border-radius:26px;background:linear-gradient(135deg,#091f43,${NAVY});display:flex;align-items:center;justify-content:center;flex-direction:column;color:white;margin-bottom:18px}.awardBanner div{font-size:52px;font-weight:1000;color:#e7c977}.awardBanner span{font-size:11px;letter-spacing:.22em;font-weight:900}.awardGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.awardCard{border-radius:21px;padding:22px;text-align:center}.awardCard>span{font-size:38px}.awardCard small{display:block;margin-top:9px;color:#9b7628;font-weight:900}.awardCard h3{min-height:44px}.awardCard b{font-size:18px}.seasonList{display:grid;gap:14px}.seasonCard{border-radius:21px;padding:22px;display:flex;align-items:center;justify-content:space-between}.seasonCard h3{font-size:24px;margin:8px 0}.seasonCard p{color:#778296}.seasonCard button{border:0;background:${NAVY};color:white;padding:11px 15px;border-radius:11px;font-weight:900}.status{font-size:10px;letter-spacing:.12em;font-weight:900;background:#edf0f4;padding:6px 8px;border-radius:999px}.status.active{background:#dff5e6;color:#247744}.menuList{display:grid;gap:10px}.menuItem{width:100%;border-radius:17px;padding:17px;display:flex;align-items:center;gap:14px;color:${NAVY};text-align:left}.menuItem>span{font-size:24px}.menuItem b{flex:1}.menuItem small{color:#8993a2}.menuItem i{font-style:normal}.menuItem:disabled{opacity:.65}.bottomNav{position:fixed;bottom:0;left:0;right:0;z-index:30;height:76px;background:rgba(255,255,255,.96);backdrop-filter:blur(18px);border-top:1px solid #e1e5eb;display:flex;justify-content:center;padding-bottom:env(safe-area-inset-bottom)}.bottomNav button{width:min(130px,20%);border:0;background:none;color:#7d8797;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}.bottomNav button span{font-size:21px;font-weight:900}.bottomNav button small{font-size:10px;font-weight:800}.bottomNav button.active{color:${NAVY}}.modalBackdrop{position:fixed;inset:0;background:rgba(3,15,33,.68);z-index:50;display:grid;place-items:center;padding:18px}.profileModal{width:min(520px,100%);max-height:88vh;overflow:auto;background:white;border-radius:28px;padding:25px;position:relative}.close{position:absolute;right:16px;top:14px;width:36px;height:36px;border-radius:50%;border:0;background:#eef1f5;font-size:22px}.profileHead{display:flex;align-items:center;gap:15px;padding-right:30px}.profileAvatar{width:76px;height:76px;border-radius:23px;background:${NAVY};color:white;display:grid;place-items:center;font-size:23px;font-weight:900}.profileHead span{font-size:10px;letter-spacing:.12em;font-weight:900;color:#9b7628}.profileHead h2{font-size:30px;margin:5px 0 0}.profileHead p{margin:2px 0;color:#748095}.profileStats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:22px 0}.profileStats span{background:#f3f5f8;border-radius:12px;padding:12px 5px;text-align:center;font-size:9px;font-weight:900;color:#7c8798}.profileStats b{display:block;font-size:18px;color:${NAVY}}.bio{line-height:1.55;color:#647187}.honor{padding:12px;background:#fbf4df;border-radius:12px;margin:8px 0;font-weight:800}.empty{color:#8993a2}.legacy{margin-top:20px;border-radius:18px;background:${NAVY};color:white;padding:18px;display:grid;grid-template-columns:1fr auto;align-items:center}.legacy span{font-size:11px;letter-spacing:.13em;font-weight:900}.legacy b{font-size:34px;color:#e7c977}.legacy small{grid-column:1/3;color:#cdd8e6}
.adminTabs{display:flex;gap:8px;overflow:auto;margin-bottom:16px}.adminTabs button{border:1px solid #dce2ea;background:white;color:${NAVY};padding:11px 15px;border-radius:999px;font-weight:900;white-space:nowrap}.adminTabs button.active{background:${NAVY};color:white}.managerGrid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr);gap:18px;align-items:start}.adminCard{background:white;border:1px solid #e1e6ed;border-radius:24px;padding:24px;box-shadow:0 12px 30px rgba(20,40,70,.07)}.adminCard h2{margin:0 0 6px;font-size:26px}.adminCard>p{margin:0 0 20px;color:#718096}.formGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.formGrid label{display:flex;flex-direction:column;gap:7px;font-size:12px;font-weight:900;color:#65738a}.formGrid input,.formGrid select,.formGrid textarea{width:100%;border:1px solid #dbe1e9;border-radius:12px;padding:13px;font:inherit;color:${NAVY};background:white}.formGrid textarea{min-height:110px;resize:vertical}.formGrid .wide{grid-column:1/-1}.formActions,.dataActions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.primary,.secondary,.danger,.uploadButton{border:0;border-radius:13px;padding:13px 17px;font-weight:900;margin-top:18px;cursor:pointer;font:inherit}.primary{background:${NAVY};color:white}.secondary,.uploadButton{background:#edf2f8;color:${NAVY}}.danger{background:#fff0f0;color:#a62e2e;border:1px solid #efcaca}.uploadButton input{display:none}.manageList{max-height:690px;overflow:auto}.manageRow{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:9px;padding:13px 0;border-top:1px solid #edf0f4}.manageRow div{display:flex;flex-direction:column;min-width:0}.manageRow b,.manageRow small{overflow:hidden;text-overflow:ellipsis}.manageRow small{color:#7b8798;margin-top:3px}.manageRow button{border:0;background:#edf2f8;color:${NAVY};border-radius:10px;padding:8px 10px;font-weight:800}.manageRow .deleteLink{background:#fff0f0;color:#a62e2e}.historyStatus{color:#718096}.historyList{margin-top:14px;border:1px solid #e1e6ed;border-radius:14px;overflow:hidden}.historyList>div{display:flex;justify-content:space-between;align-items:center;padding:11px 13px;border-top:1px solid #edf0f4}.historyList>div:first-child{border-top:0}.historyList span{display:flex;flex-direction:column}.historyList small{color:#7b8798;margin-top:2px}.historyList button{border:0;background:#edf2f8;color:${NAVY};padding:8px 10px;border-radius:9px;font-weight:800}.securityNote{margin-top:20px;padding:16px;border-radius:15px;background:#fff8e8;display:flex;flex-direction:column;gap:5px;color:#775f25}.securityNote span{line-height:1.5}.toast{position:fixed;right:18px;bottom:92px;z-index:60;background:#133e72;color:white;padding:12px 16px;border-radius:14px;font-weight:900;box-shadow:0 14px 35px rgba(0,0,0,.2)}
.upcomingList{display:grid;gap:12px}.upcomingCard{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:20px 22px;border-radius:20px;background:linear-gradient(135deg,#fff,#f7f0dd);border:1px solid #e4d5aa;box-shadow:0 10px 24px rgba(20,40,70,.05)}.upcomingCard span{font-size:12px;color:#8b6d27;font-weight:900}.upcomingCard h3{font-size:22px;margin:6px 0}.upcomingCard h3 em{font-size:12px;font-style:normal;color:#8893a2;margin:0 7px}.upcomingCard p{margin:0;color:#748095}.upcomingCard>b{font-size:10px;letter-spacing:.12em;background:${NAVY};color:white;padding:8px 10px;border-radius:999px}.boxScoreEditor{margin-top:20px;border-top:1px solid #e4e8ee;padding-top:18px}.boxScoreTitle{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}.boxScoreTitle div{display:flex;flex-direction:column}.boxScoreTitle small{color:#718096;margin-top:3px}.boxScoreTitle button{border:0;background:#edf2f8;color:${NAVY};padding:9px 11px;border-radius:10px;font-weight:800}.statLineEdit{display:grid;grid-template-columns:1.2fr .8fr repeat(4,62px) 36px;gap:7px;align-items:end;padding:9px 0;border-top:1px solid #edf0f4}.statLineEdit select,.statLineEdit input{width:100%;border:1px solid #dbe1e9;border-radius:9px;padding:9px;font:inherit;color:${NAVY};background:white}.statLineEdit label{font-size:9px;font-weight:900;color:#718096}.statLineEdit .deleteLink{height:38px;border:0;border-radius:9px;background:#fff0f0;color:#a62e2e;font-weight:900}.boxScorePublic{border-top:1px solid #edf0f4;margin-top:14px;padding-top:12px}.boxScorePublic summary{cursor:pointer;font-weight:900;color:#9b7628}.publicStatHead,.publicStatRow{display:grid;grid-template-columns:1fr repeat(4,42px);gap:5px;padding:8px 0;border-bottom:1px solid #edf0f4;text-align:center;font-size:12px}.publicStatHead{color:#7a8596;font-size:10px}.publicStatHead b,.publicStatRow b{text-align:left}.standingsTable{background:white;border:1px solid #e3e7ed;border-radius:22px;overflow:hidden;box-shadow:0 10px 24px rgba(20,40,70,.05)}.standingsHead,.standingsRow{display:grid;grid-template-columns:45px minmax(100px,1fr) repeat(5,70px);align-items:center;gap:8px;padding:14px 18px}.standingsHead{background:${NAVY};color:white;font-size:11px}.standingsRow{border-top:1px solid #edf0f4}.standingsRow strong{color:#9b7628}.hallGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.hallCard{border:1px solid #ddc98f;background:linear-gradient(145deg,#fff,#faf1d9);border-radius:23px;padding:24px;text-align:left;color:${NAVY};box-shadow:0 12px 28px rgba(80,61,18,.08)}.hallCard>span{font-size:38px}.hallCard small{display:block;color:#9b7628;font-weight:900;margin-top:12px}.hallCard h3{font-size:23px;margin:6px 0}.hallCard p{color:#718096}.hallCard b{display:inline-block;background:${NAVY};color:white;border-radius:999px;padding:7px 10px}
.backButton{border:0;background:none;color:${NAVY};font-weight:900;padding:8px 0 16px}.universeHero{display:grid;grid-template-columns:auto 1fr 280px;align-items:center;gap:25px;padding:34px;border-radius:28px;background:linear-gradient(135deg,#071c3e,${NAVY} 64%,#826522);color:white;box-shadow:0 22px 50px rgba(10,45,94,.22)}.ratingOrb{width:116px;height:116px;border-radius:32px;background:linear-gradient(145deg,#e3c16c,#9a7625);display:grid;place-items:center;align-content:center;color:#071f42;box-shadow:inset 0 0 0 5px rgba(255,255,255,.2)}.ratingOrb strong{font-size:48px;line-height:1}.ratingOrb small{font-weight:1000}.profilePhotoWrap{position:relative}.profilePhotoWrap img{width:130px;height:150px;object-fit:cover;border-radius:25px;border:3px solid #e7c977}.profilePhotoWrap b{position:absolute;right:-8px;bottom:-8px;background:${GOLD};color:${NAVY};padding:8px 10px;border-radius:11px}.universeIdentity>span{font-size:11px;letter-spacing:.14em;color:#e6ca82;font-weight:900}.universeIdentity h1{font-size:clamp(38px,6vw,64px);margin:5px 0 0;line-height:1}.universeIdentity p{margin:7px 0 15px;color:#d8e2ef}.profileTags{display:flex;gap:7px;flex-wrap:wrap}.profileTags b{font-size:9px;letter-spacing:.09em;padding:7px 9px;border-radius:999px;background:rgba(255,255,255,.12)}.legacyMeter{padding:19px;border-radius:18px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16)}.legacyMeter>div{display:flex;align-items:end;justify-content:space-between}.legacyMeter strong{font-size:35px;color:#e7c977}.legacyMeter small{font-weight:900}.legacyMeter>span,.attributeRow>span{display:block;height:8px;background:rgba(255,255,255,.16);border-radius:999px;overflow:hidden;margin:10px 0}.legacyMeter i,.attributeRow i{display:block;height:100%;background:#e7c977;border-radius:999px}.legacyMeter p{font-size:12px;color:#d5dfec;margin:0}.profileUniverseGrid{display:grid;grid-template-columns:1.15fr .85fr;gap:18px;margin-top:18px}.profilePanel{background:white;border:1px solid #e3e7ed;border-radius:23px;padding:4px 22px 22px;box-shadow:0 10px 24px rgba(20,40,70,.05)}.attributeRow{display:grid;grid-template-columns:110px 1fr 35px;align-items:center;gap:10px;padding:8px 0}.attributeRow>span{background:#e9edf2;margin:0}.attributeRow i{background:${NAVY}}.attributeRow strong{text-align:right}.profileHonor{display:flex;align-items:center;gap:10px;padding:13px 0;border-top:1px solid #edf0f4}.profileHonor span{font-size:24px}.profileGameLog{margin-top:18px}.logHead,.logRow{display:grid;grid-template-columns:1fr repeat(4,58px);align-items:center;text-align:center;gap:7px;padding:11px 0;border-top:1px solid #edf0f4}.logHead{font-size:10px;color:#718096}.logHead b,.logRow div{text-align:left}.logRow div{display:flex;flex-direction:column}.logRow small{color:#7c8798;margin-top:3px}.calendarControls{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.calendarControls button{width:42px;height:42px;border:1px solid #dfe4eb;background:white;border-radius:12px;color:${NAVY};font-weight:900}.calendarControls h2{margin:0}.calendar{background:white;border:1px solid #e1e6ed;border-radius:22px;overflow:hidden}.weekday,.calendarGrid{display:grid;grid-template-columns:repeat(7,1fr)}.weekday{background:${NAVY};color:white;padding:12px 0;text-align:center;font-size:11px}.calendarDay{min-height:125px;padding:9px;border-right:1px solid #edf0f4;border-bottom:1px solid #edf0f4}.calendarDay>span{font-size:11px;font-weight:900;color:#7a8597}.calendarDay.blank{background:#f7f8fa}.calendarGame{margin-top:7px;padding:7px;border-radius:8px;background:#fbf2d9;color:#72571e;font-size:10px}.calendarGame.final{background:#e9f0f8;color:${NAVY}}.calendarGame b,.calendarGame small{display:block}.calendarGame small{margin-top:3px;opacity:.75}.ruleHero{display:flex;align-items:center;gap:18px;padding:24px;border-radius:22px;background:${NAVY};color:white;margin-bottom:17px}.ruleHero>span{width:62px;height:62px;border-radius:18px;background:${GOLD};color:${NAVY};display:grid;place-items:center;font-weight:1000;font-size:21px}.ruleHero b{font-size:10px;letter-spacing:.15em;color:#e7c977}.ruleHero h2{margin:5px 0}.rulesGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}.ruleSection{background:white;border:1px solid #e3e7ed;border-radius:21px;padding:22px;box-shadow:0 10px 24px rgba(20,40,70,.05)}.ruleSection>div{display:flex;justify-content:space-between;align-items:center}.ruleSection>div span{font-size:30px}.ruleSection small{font-weight:900;color:#9b7628}.ruleSection h2{margin:10px 0}.ruleSection ol{padding-left:20px;color:#5f6d80;line-height:1.55}.ruleSection li{padding:5px 0}
.badgePanel{margin-top:18px}.badgeGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.playerBadge{display:flex;align-items:center;gap:10px;padding:13px;border-radius:14px;border:1px solid #dfe4eb;background:#f7f8fa}.playerBadge>span{font-size:26px}.playerBadge div{display:flex;flex-direction:column}.playerBadge small{color:#758195;margin-top:2px}.playerBadge.gold{background:#fff6d9;border-color:#e3ca79}.playerBadge.silver{background:#f0f3f6;border-color:#cbd2da}.playerBadge.bronze{background:#fbede5;border-color:#deb79f}.legacyTracker{background:white;border:1px solid #e3e7ed;border-radius:22px;padding:4px 18px}.legacyTracker button{width:100%;display:grid;grid-template-columns:32px 1fr 55px;align-items:center;gap:10px;border:0;border-top:1px solid #edf0f4;background:none;color:${NAVY};padding:13px 0;text-align:left}.legacyTracker button:first-child{border-top:0}.legacyTracker button>span{font-weight:900;color:#9b7628}.legacyTracker button>div{display:flex;flex-direction:column}.legacyTracker small{color:#788397;margin:2px 0 7px}.legacyTracker i{height:6px;background:#e8ecf1;border-radius:999px;overflow:hidden}.legacyTracker em{display:block;height:100%;background:linear-gradient(90deg,${NAVY},${GOLD});border-radius:999px}.legacyTracker strong{text-align:right}.compareSelectors{display:grid;grid-template-columns:1fr auto 1fr;align-items:end;gap:15px;margin-bottom:17px}.compareSelectors label{display:flex;flex-direction:column;gap:7px;font-size:11px;font-weight:900}.compareSelectors select{padding:13px;border:1px solid #dbe1e9;border-radius:12px;background:white;color:${NAVY};font:inherit}.compareSelectors>span{font-weight:1000;padding-bottom:13px;color:#9b7628}.compareHero{display:grid;grid-template-columns:1fr 70px 1fr;gap:14px;align-items:center}.compareIdentity{background:linear-gradient(145deg,#071c3e,${NAVY});color:white;border-radius:24px;padding:25px;text-align:center}.compareIdentity>div:first-child{width:78px;height:78px;margin:auto;border-radius:22px;background:${GOLD};color:${NAVY};display:grid;place-items:center;align-content:center;font-size:33px;font-weight:1000}.compareIdentity>div small{font-size:9px}.compareIdentity>span{display:block;margin-top:14px;font-size:10px;letter-spacing:.1em;color:#e7c977}.compareIdentity h2{font-size:28px;margin:5px 0}.compareIdentity p{color:#cfdaea}.miniBadgeRow{display:flex;justify-content:center;gap:7px}.miniBadgeRow i{width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,.12);display:grid;place-items:center;font-style:normal}.versus{font-size:20px;font-weight:1000;text-align:center;color:#9b7628}.comparisonTable{background:white;border:1px solid #e3e7ed;border-radius:22px;padding:5px 20px;margin-top:16px}.comparisonHead,.comparisonRow{display:grid;grid-template-columns:1fr 110px 1fr;text-align:center;align-items:center;padding:13px 0;border-top:1px solid #edf0f4}.comparisonHead{border-top:0}.comparisonHead span,.comparisonRow span{font-size:10px;color:#778397;font-weight:900}.comparisonRow strong:first-child{text-align:right}.comparisonRow strong:last-child{text-align:left}.comparisonRow strong.winner{color:#9b7628;font-size:21px}
@media(max-width:900px){.leaderGrid,.exploreGrid,.playerGrid{grid-template-columns:repeat(2,1fr)}.twoCol,.managerGrid,.profileUniverseGrid{grid-template-columns:1fr}.universeHero{grid-template-columns:auto 1fr}.legacyMeter{grid-column:1/3}.recordGrid,.awardGrid{grid-template-columns:repeat(2,1fr)}.hallGrid{grid-template-columns:repeat(2,1fr)}.badgeGrid{grid-template-columns:repeat(2,1fr)}.statLineEdit{grid-template-columns:1fr 1fr repeat(4,55px) 36px}}
@media(max-width:640px){.formGrid{grid-template-columns:1fr}.formGrid .wide{grid-column:auto}.adminCard{padding:18px}.topbar{height:68px;padding:0 14px}.brand small{display:none}.seasonPill{font-size:0;padding:9px}.seasonPill .syncDot{margin:4px}.commissionerStatus{align-items:flex-start;flex-direction:column}.statLineEdit{grid-template-columns:1fr 1fr repeat(2,1fr) 36px}.statLineEdit label:nth-of-type(3),.statLineEdit label:nth-of-type(4){grid-row:2}.standingsTable{overflow:auto}.standingsHead,.standingsRow{min-width:610px}.hallGrid,.rulesGrid,.badgeGrid{grid-template-columns:1fr}.universeHero{grid-template-columns:1fr;text-align:center;padding:25px}.ratingOrb{margin:auto}.profileTags{justify-content:center}.legacyMeter{grid-column:auto;text-align:left}.attributeRow{grid-template-columns:90px 1fr 30px}.compareSelectors{grid-template-columns:1fr}.compareSelectors>span{padding:0;text-align:center}.compareHero{grid-template-columns:1fr}.versus{padding:2px}.comparisonHead,.comparisonRow{grid-template-columns:1fr 80px 1fr}.calendar{overflow:auto}.weekday,.calendarGrid{min-width:760px}.calendarDay{min-height:110px}.logHead,.logRow{grid-template-columns:minmax(120px,1fr) repeat(4,42px)}main{padding:18px 14px 100px}.hero{grid-template-columns:1fr;padding:26px 22px;border-radius:24px}.hero h1{font-size:39px}.hero p{font-size:15px}.heroScore{display:none}.leaderGrid{grid-template-columns:repeat(2,1fr);gap:10px}.leaderCard{padding:14px}.leaderCard>strong{font-size:25px}.exploreGrid{grid-template-columns:1fr}.gameList,.playerGrid,.recordGrid,.awardGrid{grid-template-columns:1fr}.pageHead h1{font-size:38px}.profileStats{grid-template-columns:repeat(2,1fr)}.newsRow{grid-template-columns:1fr;gap:3px}.recordHero{align-items:flex-start}.recordHero>span{font-size:40px}.seasonCard{align-items:flex-start;gap:12px}.bottomNav{height:70px}}
`;
