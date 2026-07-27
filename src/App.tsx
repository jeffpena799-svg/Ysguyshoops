import React, { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const NAVY = "#0A2D5E";
const GOLD = "#C7A24D";

type Player = {
  id: string; name: string; nickname: string; position: string;
  wins: number; losses: number; pts: number; reb: number; ast: number; turnovers: number;
  awards: string[]; bio: string;
};

type Game = { id: string; date: string; title: string; teamA: string; scoreA: number; teamB: string; scoreB: number; mvp: string; recap: string };
type Award = { season: string; name: string; winner: string; icon: string };
type RecordItem = { category: string; label: string; holder: string; value: string; date: string };

type View = "home" | "games" | "players" | "leaders" | "more" | "records" | "awards" | "seasons" | "commissioner";

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

function gp(p: Player){ return p.wins+p.losses; }
function pct(p: Player){ return Math.round((p.wins/gp(p))*1000)/10; }
function avg(v:number,p:Player){ return Math.round((v/gp(p))*10)/10; }
function initials(name:string){ return name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase(); }

export default function App(){
  const [view,setView]=useState<View>("home");
  const [selected,setSelected]=useState<Player|null>(null);
  const [search,setSearch]=useState("");
  const [leaderKey,setLeaderKey]=useState<"pts"|"reb"|"ast"|"wins">("pts");
  const [players,setPlayers]=useState<Player[]>(()=>loadData("yg-players",initialPlayers));
  const [games,setGames]=useState<Game[]>(()=>loadData("yg-games",initialGames));
  const [awards,setAwards]=useState<Award[]>(()=>loadData("yg-awards",initialAwards));
  const [seasons,setSeasons]=useState(()=>loadData("yg-seasons",initialSeasons));
  const records=initialRecords;
  const [adminTab,setAdminTab]=useState<"game"|"player"|"award"|"data">("game");
  const [toast,setToast]=useState("");

  const saveAll=(next?:{players?:Player[];games?:Game[];awards?:Award[];seasons?:typeof initialSeasons})=>{
    const p=next?.players??players,g=next?.games??games,a=next?.awards??awards,se=next?.seasons??seasons;
    localStorage.setItem("yg-players",JSON.stringify(p));localStorage.setItem("yg-games",JSON.stringify(g));localStorage.setItem("yg-awards",JSON.stringify(a));localStorage.setItem("yg-seasons",JSON.stringify(se));
    setToast("Saved on this device");setTimeout(()=>setToast(""),1800);
  };

  const filtered=useMemo(()=>players.filter(p => `${p.name} ${p.nickname}`.toLowerCase().includes(search.toLowerCase())),[search]);
  const ranked=useMemo(()=>[...players].sort((a,b)=>b[leaderKey]-a[leaderKey]),[leaderKey]);
  const pointsLeader=[...players].sort((a,b)=>b.pts-a.pts)[0];
  const reboundsLeader=[...players].sort((a,b)=>b.reb-a.reb)[0];
  const assistsLeader=[...players].sort((a,b)=>b.ast-a.ast)[0];
  const winLeader=[...players].sort((a,b)=>pct(b)-pct(a))[0];

  const go=(next:View)=>{ setView(next); window.scrollTo({top:0,behavior:"smooth"}); };

  return <div className="app"><style>{styles}</style>
    <header className="topbar">
      <button className="brand" onClick={()=>go("home")}><span className="ball">YG</span><span><b>Y'S GUYS</b><small>League Platform · v2.1</small></span></button>
      <button className="seasonPill" onClick={()=>go("seasons")}>Summer 2026⌄</button>
    </header>

    <main>
      {view==="home" && <>
        <section className="hero">
          <div><span className="live"><i/>SEASON ACTIVE</span><h1>The official home of Y's Guys.</h1><p>Every player, game, award and record—preserved in one place.</p><div className="heroActions"><button onClick={()=>go("games")}>View latest game</button><button className="ghost" onClick={()=>go("records")}>Open record book</button></div></div>
          <div className="heroScore"><small>LATEST FINAL</small><b>66–63</b><span>Cream over Navy</span></div>
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
            {[...players].sort((a,b)=>(b.wins*2+b.pts+b.ast)-(a.wins*2+a.pts+a.ast)).slice(0,5).map((p,i)=><button className="rankRow" key={p.id} onClick={()=>setSelected(p)}><span className="rank">{i+1}</span><span className="avatar">{initials(p.name)}</span><span className="grow"><b>{p.name}</b><small>{p.wins}-{p.losses} · {avg(p.pts,p)} PPG</small></span><strong>{Math.round(p.wins*2+p.pts+p.ast)}</strong></button>)}
          </section>
        </div>

        <Section title="Explore the league" eyebrow="LEAGUE ARCHIVE" />
        <div className="exploreGrid">
          <Explore icon="🏆" title="Record Book" copy="Career, team and league records." onClick={()=>go("records")}/>
          <Explore icon="🥇" title="Awards Center" copy="Every winner, every season." onClick={()=>go("awards")}/>
          <Explore icon="👤" title="Player Profiles" copy="Stats, bios, awards and legacy." onClick={()=>go("players")}/>
          <Explore icon="📅" title="Game History" copy="Scores, recaps and MVPs." onClick={()=>go("games")}/>
        </div>
      </>}

      {view==="games" && <Page eyebrow="GAME HISTORY" title="Every game tells a story." subtitle="Complete results and recaps from the active season.">
        <div className="gameList">{games.map((g,i)=><article className="gameCard" key={g.id}><div className="gameTop"><span>{g.date}</span><b>{i===games.length-1?"LATEST":"FINAL"}</b></div><h3>{g.title}</h3><div className="scoreLine"><span>{g.teamA}</span><strong>{g.scoreA}</strong></div><div className="scoreLine loser"><span>{g.teamB}</span><strong>{g.scoreB}</strong></div><div className="mvp">⭐ Player of the Game: <b>{g.mvp}</b></div><p>{g.recap}</p></article>)}</div>
      </Page>}

      {view==="players" && <Page eyebrow="PLAYER DIRECTORY" title="The people who built the league." subtitle="Search the roster and open any profile.">
        <input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search players or nicknames…" />
        <div className="playerGrid">{filtered.map(p=><button className="playerCard" key={p.id} onClick={()=>setSelected(p)}><span className="bigAvatar">{initials(p.name)}</span><span className="pos">{p.position}</span><h3>{p.name}</h3><small>“{p.nickname}”</small><div className="miniStats"><span><b>{avg(p.pts,p)}</b>PPG</span><span><b>{avg(p.reb,p)}</b>RPG</span><span><b>{avg(p.ast,p)}</b>APG</span></div><div className="record">{p.wins}-{p.losses} · {pct(p)}%</div></button>)}</div>
      </Page>}

      {view==="leaders" && <Page eyebrow="LEAGUE LEADERS" title="See who sets the pace." subtitle="Current totals through July 26, 2026.">
        <div className="chips">{([['pts','PTS'],['reb','REB'],['ast','AST'],['wins','WINS']] as const).map(([k,l])=><button className={leaderKey===k?"active":""} onClick={()=>setLeaderKey(k)} key={k}>{l}</button>)}</div>
        <section className="chart"><ResponsiveContainer width="100%" height={420}><BarChart data={ranked} layout="vertical" margin={{left:10,right:24}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" hide/><YAxis type="category" dataKey="name" width={76} tick={{fontSize:12,fontWeight:700,fill:NAVY}} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey={leaderKey} fill={NAVY} radius={[0,8,8,0]}/></BarChart></ResponsiveContainer></section>
      </Page>}

      {view==="records" && <Page eyebrow="THE ARCHIVE" title="Y's Guys Record Book" subtitle="The marks everyone is chasing.">
        <div className="recordHero"><span>🏆</span><div><small>FEATURED RECORD</small><h2>Paul Peters · Best Win Percentage</h2><p>81.0% across 21 games</p></div></div>
        <div className="recordGrid">{records.map((r,i)=><article className="recordCard" key={i}><span>{r.category}</span><h3>{r.label}</h3><strong>{r.value}</strong><b>{r.holder}</b><small>{r.date}</small></article>)}</div>
        <div className="note">Version 2.1 establishes the record-book structure. Individual game records can become automatic once each full box score is entered.</div>
      </Page>}

      {view==="awards" && <Page eyebrow="TROPHY ROOM" title="Awards Center" subtitle="Celebrating the players who shaped each season.">
        <div className="awardBanner"><div>2025</div><span>OFFICIAL AWARD CLASS</span></div>
        <div className="awardGrid">{awards.map(a=><article className="awardCard" key={a.name}><span>{a.icon}</span><small>{a.season}</small><h3>{a.name}</h3><b>{a.winner}</b></article>)}</div>
      </Page>}

      {view==="seasons" && <Page eyebrow="SEASON ARCHIVE" title="Choose an era." subtitle="Every season will keep its own games, leaders, awards and champion.">
        <div className="seasonList">{seasons.map(s=><article className="seasonCard" key={s.name}><div><span className={s.status==="Active"?"status active":"status"}>{s.status}</span><h3>{s.name}</h3><p>{s.games} recorded games · Champion: {s.champion}</p></div><button onClick={()=>go("home")}>Open →</button></article>)}</div>
      </Page>}

      {view==="commissioner" && <Page eyebrow="COMMISSIONER MODE" title="Run the league without editing code." subtitle="Add games, players and awards. Changes save to this browser automatically.">
        <div className="adminTabs">
          {([['game','New game'],['player','New player'],['award','New award'],['data','Data tools']] as const).map(([k,l])=><button key={k} className={adminTab===k?'active':''} onClick={()=>setAdminTab(k)}>{l}</button>)}
        </div>
        {adminTab==='game' && <GameForm players={players} onAdd={(g)=>{const next=[...games,g];setGames(next);saveAll({games:next});}}/>}
        {adminTab==='player' && <PlayerForm onAdd={(p)=>{const next=[...players,p];setPlayers(next);saveAll({players:next});}}/>}
        {adminTab==='award' && <AwardForm players={players} onAdd={(a)=>{const next=[...awards,a];setAwards(next);saveAll({awards:next});}}/>}
        {adminTab==='data' && <DataTools onExport={()=>exportData({players,games,awards,seasons})} onReset={()=>{if(confirm('Reset all locally saved changes?')){localStorage.removeItem('yg-players');localStorage.removeItem('yg-games');localStorage.removeItem('yg-awards');localStorage.removeItem('yg-seasons');location.reload();}}}/>}
      </Page>}

      {view==="more" && <Page eyebrow="LEAGUE MENU" title="More from Y's Guys" subtitle="History, honors and league information."><div className="menuList"><Menu label="Record Book" icon="🏆" onClick={()=>go("records")}/><Menu label="Awards Center" icon="🥇" onClick={()=>go("awards")}/><Menu label="Season Archive" icon="🗂️" onClick={()=>go("seasons")}/><Menu label="Hall of Fame" icon="🏛️" badge="Coming in v2.2"/><Menu label="Commissioner Mode" icon="🔒" onClick={()=>go("commissioner")}/></div></Page>}
    </main>

    {toast && <div className="toast">✓ {toast}</div>}
    <nav className="bottomNav">
      <Nav label="Home" icon="⌂" active={view==="home"} onClick={()=>go("home")}/><Nav label="Games" icon="◉" active={view==="games"} onClick={()=>go("games")}/><Nav label="Players" icon="◎" active={view==="players"} onClick={()=>go("players")}/><Nav label="Leaders" icon="↗" active={view==="leaders"} onClick={()=>go("leaders")}/><Nav label="More" icon="•••" active={["more","records","awards","seasons","commissioner"].includes(view)} onClick={()=>go("more")}/>
    </nav>

    {selected && <div className="modalBackdrop" onClick={()=>setSelected(null)}><article className="profileModal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><div className="profileHead"><span className="profileAvatar">{initials(selected.name)}</span><div><span>{selected.position} · SUMMER 2026</span><h2>{selected.name}</h2><p>“{selected.nickname}”</p></div></div><div className="profileStats"><span><b>{avg(selected.pts,selected)}</b>PPG</span><span><b>{avg(selected.reb,selected)}</b>RPG</span><span><b>{avg(selected.ast,selected)}</b>APG</span><span><b>{pct(selected)}%</b>WIN</span></div><p className="bio">{selected.bio}</p><h4>Awards & honors</h4>{selected.awards.length?selected.awards.map(a=><div className="honor" key={a}>🏆 {a}</div>):<div className="empty">No recorded awards yet.</div>}<div className="legacy"><span>LEGACY SCORE</span><b>{Math.min(99,Math.round(selected.wins*2+selected.pts/3+selected.ast/2))}</b><small>Foundation rating · formula will evolve</small></div></article></div>}
  </div>
}

function Section({eyebrow,title,action,onAction}:{eyebrow:string,title:string,action?:string,onAction?:()=>void}){return <div className="sectionTitle"><div><span>{eyebrow}</span><h2>{title}</h2></div>{action&&<button onClick={onAction}>{action}</button>}</div>}
function LeaderCard({label,player,value,suffix}:{label:string,player:Player,value:string|number,suffix:string}){return <article className="leaderCard"><small>{label}</small><div><span className="avatar">{initials(player.name)}</span><b>{player.name}</b></div><strong>{value}</strong><em>{suffix}</em></article>}
function Explore({icon,title,copy,onClick}:{icon:string,title:string,copy:string,onClick:()=>void}){return <button className="explore" onClick={onClick}><span>{icon}</span><div><b>{title}</b><small>{copy}</small></div><i>→</i></button>}
function Page({eyebrow,title,subtitle,children}:{eyebrow:string,title:string,subtitle:string,children:React.ReactNode}){return <><header className="pageHead"><span>{eyebrow}</span><h1>{title}</h1><p>{subtitle}</p></header>{children}</>}
function Menu({label,icon,onClick,badge}:{label:string,icon:string,onClick?:()=>void,badge?:string}){return <button className="menuItem" onClick={onClick} disabled={!onClick}><span>{icon}</span><b>{label}</b>{badge?<small>{badge}</small>:<i>→</i>}</button>}
function Nav({label,icon,active,onClick}:{label:string,icon:string,active:boolean,onClick:()=>void}){return <button className={active?"active":""} onClick={onClick}><span>{icon}</span><small>{label}</small></button>}

const styles = `
*{box-sizing:border-box}body{margin:0;background:#f3f5f8;color:${NAVY};font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.app{min-height:100vh}.topbar{height:76px;position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;padding:0 max(20px,calc((100vw - 1180px)/2));background:rgba(255,255,255,.94);backdrop-filter:blur(16px);border-bottom:1px solid #e7eaf0}.brand{display:flex;align-items:center;gap:12px;border:0;background:none;color:${NAVY};text-align:left}.brand .ball{width:42px;height:42px;border-radius:14px;background:${NAVY};color:white;display:grid;place-items:center;font-weight:900}.brand b{display:block;letter-spacing:.08em}.brand small{display:block;color:#6c7890;margin-top:2px}.seasonPill{border:1px solid #dbe0e8;background:white;padding:10px 14px;border-radius:999px;color:${NAVY};font-weight:800}main{max-width:1180px;margin:auto;padding:28px 20px 110px}.hero{background:linear-gradient(135deg,#081f43,${NAVY} 60%,#144b85);color:white;border-radius:30px;padding:38px;display:grid;grid-template-columns:1.5fr .7fr;gap:28px;box-shadow:0 22px 50px rgba(10,45,94,.22);overflow:hidden;position:relative}.hero:after{content:"";position:absolute;width:320px;height:320px;border-radius:50%;background:rgba(199,162,77,.12);right:-100px;top:-120px}.live{font-size:11px;font-weight:900;letter-spacing:.14em;background:rgba(255,255,255,.12);padding:8px 11px;border-radius:999px;display:inline-flex;gap:7px;align-items:center}.live i{width:7px;height:7px;border-radius:50%;background:#65df8b}.hero h1{font-size:clamp(34px,6vw,62px);line-height:.98;max-width:720px;margin:20px 0 14px}.hero p{font-size:18px;max-width:610px;color:#dfe8f4}.heroActions{display:flex;gap:10px;flex-wrap:wrap;margin-top:24px}.heroActions button{border:0;background:${GOLD};color:#071f42;padding:13px 17px;border-radius:13px;font-weight:900}.heroActions .ghost{background:transparent;border:1px solid rgba(255,255,255,.35);color:white}.heroScore{align-self:center;border:1px solid rgba(255,255,255,.18);background:rgba(255,255,255,.09);border-radius:22px;padding:24px;display:flex;flex-direction:column;position:relative;z-index:1}.heroScore small{letter-spacing:.14em;font-weight:900}.heroScore b{font-size:48px;margin:8px 0}.heroScore span{color:#dce5f2}.sectionTitle{display:flex;align-items:end;justify-content:space-between;margin:34px 2px 16px}.sectionTitle span,.pageHead>span{font-size:11px;letter-spacing:.16em;font-weight:900;color:#9b7628}.sectionTitle h2{margin:4px 0 0;font-size:26px}.sectionTitle button{border:0;background:none;color:${NAVY};font-weight:900}.leaderGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.leaderCard,.panel,.chart,.gameCard,.playerCard,.recordCard,.awardCard,.seasonCard,.menuItem{background:white;border:1px solid #e6e9ef;box-shadow:0 10px 26px rgba(23,42,73,.06)}.leaderCard{border-radius:20px;padding:18px}.leaderCard>small{color:#778399;font-weight:800}.leaderCard>div{display:flex;align-items:center;gap:9px;margin:14px 0}.avatar{width:36px;height:36px;border-radius:12px;display:grid;place-items:center;background:#edf1f7;color:${NAVY};font-size:12px;font-weight:900}.leaderCard>strong{font-size:31px}.leaderCard em{font-size:11px;font-style:normal;font-weight:900;margin-left:6px;color:#9b7628}.twoCol{display:grid;grid-template-columns:1.15fr .85fr;gap:18px}.panel{border-radius:24px;padding:0 20px 18px}.panel .sectionTitle{margin-top:20px}.featureNews{border-radius:18px;background:${NAVY};color:white;padding:22px}.featureNews span{font-size:10px;font-weight:900;letter-spacing:.15em;color:#e8c876}.featureNews h3{font-size:23px;margin:8px 0}.featureNews p{color:#dce5f0}.featureNews button{border:0;background:none;color:#e8c876;font-weight:900;padding:0}.newsRow{display:grid;grid-template-columns:125px 1fr;gap:12px;padding:15px 3px;border-bottom:1px solid #edf0f4;font-size:14px}.newsRow span{color:#6f7a8d}.rankRow{width:100%;display:flex;align-items:center;gap:10px;border:0;border-bottom:1px solid #edf0f4;background:none;padding:12px 0;color:${NAVY};text-align:left}.rank{font-weight:900;width:20px}.grow{display:flex;flex-direction:column;flex:1}.grow small{color:#7c8798;margin-top:2px}.exploreGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.explore{border:1px solid #e3e7ed;background:white;border-radius:20px;padding:20px;text-align:left;display:flex;align-items:center;gap:13px;color:${NAVY};box-shadow:0 10px 24px rgba(20,40,70,.05)}.explore>span{font-size:28px}.explore div{display:flex;flex-direction:column;flex:1}.explore small{color:#788397;margin-top:4px;line-height:1.35}.explore i{font-style:normal;font-weight:900}.pageHead{padding:22px 2px 24px}.pageHead h1{font-size:clamp(34px,6vw,56px);line-height:1;margin:8px 0 12px}.pageHead p{color:#6e798b;font-size:17px;margin:0}.gameList{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}.gameCard{border-radius:24px;padding:24px}.gameTop{display:flex;justify-content:space-between;color:#7b8698;font-size:12px}.gameTop b{color:#9b7628}.gameCard h3{font-size:22px}.scoreLine{display:flex;justify-content:space-between;font-size:20px;padding:11px 0;border-bottom:1px solid #edf0f4}.scoreLine strong{font-size:28px}.scoreLine.loser{color:#758197}.mvp{margin:16px 0 8px;padding:10px 12px;background:#f8f1df;border-radius:12px;font-size:13px}.gameCard p{color:#6d788b;line-height:1.55}.search{width:100%;padding:15px 17px;border-radius:15px;border:1px solid #dfe4eb;font-size:16px;margin-bottom:18px}.playerGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:15px}.playerCard{border-radius:22px;padding:20px;text-align:left;color:${NAVY};position:relative}.bigAvatar{width:58px;height:58px;border-radius:18px;display:grid;place-items:center;background:${NAVY};color:white;font-weight:900;font-size:18px}.pos{position:absolute;right:16px;top:16px;background:#f1e7cc;color:#87671f;border-radius:999px;padding:6px 9px;font-size:11px;font-weight:900}.playerCard h3{margin:14px 0 2px;font-size:20px}.playerCard>small{color:#7d8899}.miniStats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin:16px 0}.miniStats span{background:#f5f7fa;border-radius:10px;padding:9px 4px;text-align:center;font-size:9px;font-weight:900;color:#8a94a4}.miniStats b{display:block;color:${NAVY};font-size:15px}.record{font-size:13px;font-weight:800}.chips{display:flex;gap:8px;overflow:auto;margin-bottom:16px}.chips button{border:1px solid #dfe4eb;background:white;color:${NAVY};font-weight:900;padding:10px 15px;border-radius:999px}.chips button.active{background:${NAVY};color:white}.chart{border-radius:24px;padding:20px}.recordHero{display:flex;align-items:center;gap:20px;background:linear-gradient(135deg,#f7edd1,#fff);border:1px solid #ead8a8;border-radius:25px;padding:24px;margin-bottom:18px}.recordHero>span{font-size:55px}.recordHero small{letter-spacing:.14em;font-weight:900;color:#9b7628}.recordHero h2{margin:5px 0}.recordHero p{margin:0;color:#776639}.recordGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.recordCard{border-radius:20px;padding:20px;display:flex;flex-direction:column}.recordCard>span{font-size:10px;letter-spacing:.12em;font-weight:900;color:#9b7628}.recordCard h3{margin:8px 0}.recordCard strong{font-size:30px}.recordCard b{margin:7px 0}.recordCard small{color:#7c8798}.note{margin-top:18px;background:#eaf0f7;border-radius:16px;padding:16px;color:#52637b;font-size:14px}.awardBanner{height:150px;border-radius:26px;background:linear-gradient(135deg,#091f43,${NAVY});display:flex;align-items:center;justify-content:center;flex-direction:column;color:white;margin-bottom:18px}.awardBanner div{font-size:52px;font-weight:1000;color:#e7c977}.awardBanner span{font-size:11px;letter-spacing:.22em;font-weight:900}.awardGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.awardCard{border-radius:21px;padding:22px;text-align:center}.awardCard>span{font-size:38px}.awardCard small{display:block;margin-top:9px;color:#9b7628;font-weight:900}.awardCard h3{min-height:44px}.awardCard b{font-size:18px}.seasonList{display:grid;gap:14px}.seasonCard{border-radius:21px;padding:22px;display:flex;align-items:center;justify-content:space-between}.seasonCard h3{font-size:24px;margin:8px 0}.seasonCard p{color:#778296}.seasonCard button{border:0;background:${NAVY};color:white;padding:11px 15px;border-radius:11px;font-weight:900}.status{font-size:10px;letter-spacing:.12em;font-weight:900;background:#edf0f4;padding:6px 8px;border-radius:999px}.status.active{background:#dff5e6;color:#247744}.menuList{display:grid;gap:10px}.menuItem{width:100%;border-radius:17px;padding:17px;display:flex;align-items:center;gap:14px;color:${NAVY};text-align:left}.menuItem>span{font-size:24px}.menuItem b{flex:1}.menuItem small{color:#8993a2}.menuItem i{font-style:normal}.menuItem:disabled{opacity:.65}.bottomNav{position:fixed;bottom:0;left:0;right:0;z-index:30;height:76px;background:rgba(255,255,255,.96);backdrop-filter:blur(18px);border-top:1px solid #e1e5eb;display:flex;justify-content:center;padding-bottom:env(safe-area-inset-bottom)}.bottomNav button{width:min(130px,20%);border:0;background:none;color:#7d8797;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px}.bottomNav button span{font-size:21px;font-weight:900}.bottomNav button small{font-size:10px;font-weight:800}.bottomNav button.active{color:${NAVY}}.modalBackdrop{position:fixed;inset:0;background:rgba(3,15,33,.68);z-index:50;display:grid;place-items:center;padding:18px}.profileModal{width:min(520px,100%);max-height:88vh;overflow:auto;background:white;border-radius:28px;padding:25px;position:relative}.close{position:absolute;right:16px;top:14px;width:36px;height:36px;border-radius:50%;border:0;background:#eef1f5;font-size:22px}.profileHead{display:flex;align-items:center;gap:15px;padding-right:30px}.profileAvatar{width:76px;height:76px;border-radius:23px;background:${NAVY};color:white;display:grid;place-items:center;font-size:23px;font-weight:900}.profileHead span{font-size:10px;letter-spacing:.12em;font-weight:900;color:#9b7628}.profileHead h2{font-size:30px;margin:5px 0 0}.profileHead p{margin:2px 0;color:#748095}.profileStats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:22px 0}.profileStats span{background:#f3f5f8;border-radius:12px;padding:12px 5px;text-align:center;font-size:9px;font-weight:900;color:#7c8798}.profileStats b{display:block;font-size:18px;color:${NAVY}}.bio{line-height:1.55;color:#647187}.honor{padding:12px;background:#fbf4df;border-radius:12px;margin:8px 0;font-weight:800}.empty{color:#8993a2}.legacy{margin-top:20px;border-radius:18px;background:${NAVY};color:white;padding:18px;display:grid;grid-template-columns:1fr auto;align-items:center}.legacy span{font-size:11px;letter-spacing:.13em;font-weight:900}.legacy b{font-size:34px;color:#e7c977}.legacy small{grid-column:1/3;color:#cdd8e6}
.adminTabs{display:flex;gap:8px;overflow:auto;margin-bottom:16px}.adminTabs button{border:1px solid #dce2ea;background:white;color:${NAVY};padding:11px 15px;border-radius:999px;font-weight:900;white-space:nowrap}.adminTabs button.active{background:${NAVY};color:white}.adminCard{background:white;border:1px solid #e1e6ed;border-radius:24px;padding:24px;box-shadow:0 12px 30px rgba(20,40,70,.07)}.adminCard h2{margin:0 0 6px;font-size:26px}.adminCard>p{margin:0 0 20px;color:#718096}.formGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.formGrid label{display:flex;flex-direction:column;gap:7px;font-size:12px;font-weight:900;color:#65738a}.formGrid input,.formGrid select,.formGrid textarea{width:100%;border:1px solid #dbe1e9;border-radius:12px;padding:13px;font:inherit;color:${NAVY};background:white}.formGrid textarea{min-height:110px;resize:vertical}.formGrid .wide{grid-column:1/-1}.primary,.danger{border:0;border-radius:13px;padding:13px 17px;font-weight:900;margin-top:18px}.primary{background:${NAVY};color:white}.danger{background:#fff0f0;color:#a62e2e;border:1px solid #efcaca}.dataActions{display:flex;gap:10px;flex-wrap:wrap}.securityNote{margin-top:20px;padding:16px;border-radius:15px;background:#fff8e8;display:flex;flex-direction:column;gap:5px;color:#775f25}.securityNote span{line-height:1.5}.toast{position:fixed;right:18px;bottom:92px;z-index:60;background:#133e72;color:white;padding:12px 16px;border-radius:14px;font-weight:900;box-shadow:0 14px 35px rgba(0,0,0,.2)}
@media(max-width:900px){.leaderGrid,.exploreGrid,.playerGrid{grid-template-columns:repeat(2,1fr)}.twoCol{grid-template-columns:1fr}.recordGrid,.awardGrid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.formGrid{grid-template-columns:1fr}.formGrid .wide{grid-column:auto}.adminCard{padding:18px}.topbar{height:68px;padding:0 14px}.brand small{display:none}.seasonPill{font-size:11px;padding:9px 10px}main{padding:18px 14px 100px}.hero{grid-template-columns:1fr;padding:26px 22px;border-radius:24px}.hero h1{font-size:39px}.hero p{font-size:15px}.heroScore{display:none}.leaderGrid{grid-template-columns:repeat(2,1fr);gap:10px}.leaderCard{padding:14px}.leaderCard>strong{font-size:25px}.exploreGrid{grid-template-columns:1fr}.gameList,.playerGrid,.recordGrid,.awardGrid{grid-template-columns:1fr}.pageHead h1{font-size:38px}.profileStats{grid-template-columns:repeat(2,1fr)}.newsRow{grid-template-columns:1fr;gap:3px}.recordHero{align-items:flex-start}.recordHero>span{font-size:40px}.seasonCard{align-items:flex-start;gap:12px}.bottomNav{height:70px}}
`;
