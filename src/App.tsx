import React, { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const NAVY = "#0A2D5E";
const GOLD = "#C7A24D";

type Player = {
  id: string; name: string; nickname: string; position: string;
  wins: number; losses: number; pts: number; reb: number; ast: number; turnovers: number;
  awards: string[]; bio: string; jerseyNumber?:string; height?:string; strengths?:string;
  signatureBadge?:string; photoUrl?:string; bannerColor?:string; overallOverride?:number;
};

type StatLine = { playerId:string; team:string; pts:number; reb:number; ast:number; turnovers:number };
type GameStatus = "scheduled" | "final";
type Game = { id: string; date: string; startTime?:string; location?:string; status?:GameStatus; title: string; teamA: string; scoreA: number; teamB: string; scoreB: number; mvp: string; recap: string; boxScore?:StatLine[] };
type Award = { season: string; name: string; winner: string; icon: string };
type RecordItem = { category: string; label: string; holder: string; value: string; date: string };
type NewsStory = {
  id:string; headline:string; summary:string; category:string; date:string;
  imageUrl?:string; featured:boolean; published:boolean;
};
type RsvpStatus = "going" | "maybe" | "out";
type RunRsvp = { playerId:string; status:RsvpStatus; arrivalTime?:string; note?:string; updatedAt:string };
type SundayRun = {
  id:string; date:string; title:string; startTime:string; location:string; deadline?:string;
  notes?:string; status:"open"|"locked"|"cancelled"; rsvps:RunRsvp[];
};
type PollVote = { playerId:string; nomineeId:string; updatedAt:string };
type LeaguePoll = {
  id:string; title:string; description:string; category:string; deadline?:string;
  status:"open"|"closed"; nomineeIds:string[]; votes:PollVote[]; createdAt:string;
};
type HistoryEntry = {
  id:string; date:string; title:string; description:string;
  category:"Milestone"|"Past Game"|"Championship"|"Award"|"Community"|"Rule Change"|"Other";
  icon:string; imageUrl?:string;
};
type LeagueBranding = { logoUrl?:string; wordmark:string; tagline:string };
type RankingEntry = { playerId?:string; playerName:string; rank:number|null; movement:number|null; dnp:boolean; reason:string };
type PowerRankingSnapshot = { id:string; week:number; date:string; publishedAt:string; entries:RankingEntry[] };
type LeagueSubmission = {
  id:string; type:"profile-photo"|"suggestion"; playerId:string; message:string; imageUrl?:string;
  status:"pending"|"approved"|"rejected"|"archived"; createdAt:string;
};

type View = "home" | "attendance" | "community" | "games" | "players" | "profile" | "compare" | "leaders" | "more" | "records" | "awards" | "seasons" | "calendar" | "rules" | "hof" | "timeline" | "voting" | "studio" | "commissioner";
type AdminTab = "dashboard"|"review"|"rankings"|"runs"|"games"|"players"|"history"|"news"|"polls"|"awards"|"branding"|"data";

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
  { id:"g-0719", date:"July 19, 2026", title:"Summer League Week 1", teamA:"Side A", scoreA:74, teamB:"Side B", scoreB:69, mvp:"Vic", recap:"Vic set the scoring tone while Side A held off a late rally in the opening week." },
  { id:"g-0726", date:"July 26, 2026", title:"Summer League Week 2", teamA:"Side A", scoreA:66, teamB:"Side B", scoreB:63, mvp:"Paul Peters", recap:"Paul controlled the final minutes as the game came down to one possession." },
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

const initialNews:NewsStory[] = [
  {id:"news-week-2",headline:"Paul closes the door in a Week 2 thriller",summary:"Cream survived Navy 66–63 in the closest game of the season.",category:"Game Recap",date:"July 26, 2026",featured:true,published:true},
  {id:"news-record-watch",headline:"Vic leads the scoring race",summary:"The scoring race has tightened with Vic sitting at 73 total points.",category:"Record Watch",date:"July 26, 2026",featured:false,published:true},
  {id:"news-awards",headline:"The 2025 award class joins the universe",summary:"Every recorded honor now follows its winner into the player profile and legacy system.",category:"League News",date:"July 25, 2026",featured:false,published:true},
];

const initialRuns:SundayRun[] = [
  {id:"run-2026-08-02",date:"2026-08-02",title:"Sunday Run",startTime:"9:00 AM",location:"Highland YMCA",deadline:"2026-08-01T19:00",notes:"Mark your availability so everyone knows the expected turnout.",status:"open",rsvps:[]},
];
const initialPolls:LeaguePoll[] = [
  {id:"poll-weekly-mvp",title:"Sunday Run MVP",description:"Vote for the player who made the biggest impact in the latest run.",category:"Weekly Award",status:"open",nomineeIds:["steve","vic","paul","jose","jeffrey","ty"],votes:[],createdAt:"2026-07-27T12:00:00.000Z"},
];
const initialHistory:HistoryEntry[] = [
  {id:"history-league-founded",date:"2025-01-01",title:"The league story begins",description:"The opening chapter of the Y's Guys archive. The Commissioner can correct this date and add the moments that came before the digital record.",category:"Milestone",icon:"🏀"},
];
const initialBranding:LeagueBranding = { logoUrl:"/ys-guys-mark.jpeg", wordmark:"Y'S GUYS", tagline:"League Universe" };
const initialRankings:PowerRankingSnapshot[] = [{
  id:"power-week-2", week:2, date:"2026-07-26", publishedAt:"2026-07-26T20:00:00.000Z",
  entries:[
    {playerId:"steve",playerName:"Steve",rank:1,movement:0,dnp:false,reason:"Still owns the throne with the strongest overall season résumé."},
    {playerId:"paul",playerName:"Paul Peters",rank:2,movement:3,dnp:false,reason:"The league’s best record forces him into the title conversation."},
    {playerId:"vic",playerName:"Vic",rank:3,movement:-1,dnp:false,reason:"Continues to combine strong scoring with winning basketball."},
    {playerId:"ty",playerName:"Ty",rank:4,movement:0,dnp:false,reason:"Efficient, mistake-free play keeps him firmly in the top four."},
    {playerId:"jose",playerName:"Jose",rank:5,movement:2,dnp:false,reason:"League-leading scoring and strong individual impact push him into the top five."},
    {playerId:"alex",playerName:"Alex",rank:6,movement:-3,dnp:false,reason:"Elite playmaking keeps him near the top despite the difficult record."},
    {playerId:"jeffrey",playerName:"Jeffrey",rank:7,movement:-1,dnp:false,reason:"Strong rebounding and interior impact remain valuable."},
    {playerId:"nick-p",playerName:"Nick Peters",rank:8,movement:1,dnp:false,reason:"Efficient, dependable, and one of the league’s strongest facilitators."},
    {playerId:"hunter",playerName:"Hunter",rank:9,movement:2,dnp:false,reason:"Back in action and building positive momentum."},
    {playerId:"mario",playerName:"Mario",rank:10,movement:-2,dnp:false,reason:"Remains a steady contributor, but stronger cases developed around him."},
    {playerId:"nick-d",playerName:"Nick D",rank:11,movement:0,dnp:false,reason:"Solid contributions provide a foundation, with room to move upward."},
    {playerId:"mike",playerName:"Mike",rank:12,movement:-2,dnp:false,reason:"Week 1 production still matters, but limited season sample moves him down."},
    {playerName:"Sal",rank:15,movement:0,dnp:true,reason:"DNP"},
    {playerName:"Dusko",rank:15,movement:0,dnp:true,reason:"DNP"},
    {playerName:"Sasa",rank:15,movement:0,dnp:true,reason:"DNP"},
  ],
}];
const initialSubmissions:LeagueSubmission[] = [];

const HALL_MILESTONES = {
  pts:[
    {threshold:500,hallPoints:2,banner:"Bucket Club"},
    {threshold:1000,hallPoints:3,banner:"1K Club"},
    {threshold:2500,hallPoints:6,banner:"Elite Scorer"},
    {threshold:5000,hallPoints:10,banner:"Scoring Legend"},
    {threshold:8000,hallPoints:15,banner:"Immortal Scorer"},
  ],
  reb:[
    {threshold:250,hallPoints:2,banner:"Glass Cleaner"},
    {threshold:500,hallPoints:3,banner:"Board Collector"},
    {threshold:1000,hallPoints:5,banner:"1K Rebound Club"},
    {threshold:1500,hallPoints:6,banner:"Elite Rebounder"},
    {threshold:2500,hallPoints:10,banner:"Rebounding Legend"},
    {threshold:5000,hallPoints:10,banner:"Immortal Rebounder"},
  ],
  ast:[
    {threshold:100,hallPoints:2,banner:"Ball Mover"},
    {threshold:200,hallPoints:3,banner:"Playmaker"},
    {threshold:500,hallPoints:5,banner:"Floor General"},
    {threshold:750,hallPoints:6,banner:"Elite Facilitator"},
    {threshold:1000,hallPoints:10,banner:"1K Assist Club"},
    {threshold:2000,hallPoints:15,banner:"Legendary Playmaker"},
  ],
  wins:[
    {threshold:50,hallPoints:2,banner:"50 Wins Club"},
    {threshold:100,hallPoints:2,banner:"Century Winner"},
    {threshold:200,hallPoints:3,banner:"Proven Winner"},
    {threshold:300,hallPoints:4,banner:"300 Wins Club"},
    {threshold:400,hallPoints:5,banner:"Winning Standard"},
    {threshold:500,hallPoints:6,banner:"500 Wins Club"},
    {threshold:750,hallPoints:8,banner:"Elite Winner"},
    {threshold:1000,hallPoints:10,banner:"1K Wins Club"},
  ],
} as const;

type LeagueData = { players: Player[]; games: Game[]; awards: Award[]; seasons: typeof initialSeasons; news:NewsStory[]; runs:SundayRun[]; polls:LeaguePoll[]; history:HistoryEntry[]; branding:LeagueBranding; rankings:PowerRankingSnapshot[]; submissions:LeagueSubmission[] };

function gp(p: Player){ return p.wins+p.losses; }
function pct(p: Player){ return gp(p) ? Math.round((p.wins/gp(p))*1000)/10 : 0; }
function avg(v:number,p:Player){ return gp(p) ? Math.round((v/gp(p))*10)/10 : 0; }
function initials(name:string){ return name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase(); }
function awardHallPoints(name:string){
  const value=name.toLowerCase();
  if(value.includes("most valuable")||/\bmvp\b/.test(value))return 15;
  if(value.includes("defensive player")||value.includes("dpoy"))return 10;
  if(value.includes("clutch")||value.includes("most improved")||value.includes("hustle")||value.includes("locker room")||value.includes("pat bev"))return 5;
  return 0;
}
function hallStatus(total:number){
  if(total>=100)return "Hall of Fame Eligible";
  if(total>=75)return "Hall Watch";
  if(total>=50)return "League Standout";
  if(total>=25)return "Building a Résumé";
  return "Career Beginning";
}
function hallProgress(total:number){return Math.min(100,total);}
function hallResume(player:Player,awards:Award[]){
  const stats=[
    {key:"pts" as const,label:"Career Points",value:player.pts},
    {key:"reb" as const,label:"Career Rebounds",value:player.reb},
    {key:"ast" as const,label:"Career Assists",value:player.ast},
    {key:"wins" as const,label:"Career Wins",value:player.wins},
  ];
  const milestones=stats.flatMap(stat=>HALL_MILESTONES[stat.key].filter(item=>stat.value>=item.threshold).map(item=>({...item,category:stat.label,value:stat.value})));
  const officialAwards=awards.filter(award=>award.winner.trim().toLowerCase()===player.name.trim().toLowerCase()).map(award=>({...award,hallPoints:awardHallPoints(award.name)})).filter(award=>award.hallPoints>0);
  const milestonePoints=milestones.reduce((sum,item)=>sum+item.hallPoints,0);
  const awardPoints=officialAwards.reduce((sum,item)=>sum+item.hallPoints,0);
  const total=milestonePoints+awardPoints;
  return {total,milestonePoints,awardPoints,milestones,officialAwards,status:hallStatus(total)};
}
function calculatedOverall(p:Player){ return Math.min(99,Math.round(60+avg(p.pts,p)*1.4+avg(p.reb,p)+avg(p.ast,p)*1.2+pct(p)*.08)); }
function overallRating(p:Player){ return typeof p.overallOverride==="number"?Math.max(40,Math.min(99,Math.round(p.overallOverride))):calculatedOverall(p); }
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
  const blob=new Blob([JSON.stringify({...data,exportedAt:new Date().toISOString(),version:"4.9.0"},null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;link.download=`ys-guys-backup-${new Date().toISOString().slice(0,10)}.json`;link.click();
  URL.revokeObjectURL(url);
}
function makeId(prefix:string){ return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`; }
function localDate(value:string){const [year,month,day]=value.split("-").map(Number);return new Date(year,month-1,day);}
function formatRunDate(value:string){return localDate(value).toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});}
function runCounts(run:SundayRun){return {
  going:run.rsvps.filter(item=>item.status==="going").length,
  maybe:run.rsvps.filter(item=>item.status==="maybe").length,
  out:run.rsvps.filter(item=>item.status==="out").length,
};}
function normalizeLegacyGames(games:Game[]){
  const legacy=new Set(["navy","cream","gold"]);
  return games.map(game=>{
    if(!legacy.has(game.teamA.toLowerCase())&&!legacy.has(game.teamB.toLowerCase()))return game;
    const mapTeam=(team:string)=>team===game.teamA?"Side A":"Side B";
    return {...game,teamA:"Side A",teamB:"Side B",boxScore:game.boxScore?.map(line=>({...line,team:mapTeam(line.team)}))};
  });
}
async function compressImage(file:File):Promise<string>{
  if(!file.type.startsWith("image/"))throw new Error("Choose an image file");
  if(file.size>12_000_000)throw new Error("Image must be under 12 MB");
  const source=await createImageBitmap(file);
  const max=900,scale=Math.min(1,max/Math.max(source.width,source.height));
  const canvas=document.createElement("canvas");
  canvas.width=Math.max(1,Math.round(source.width*scale));canvas.height=Math.max(1,Math.round(source.height*scale));
  const context=canvas.getContext("2d");if(!context)throw new Error("Image processing unavailable");
  context.drawImage(source,0,0,canvas.width,canvas.height);source.close();
  return canvas.toDataURL("image/jpeg",.68);
}
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
  const [myPlayerId,setMyPlayerId]=useState(()=>localStorage.getItem("yg-my-player")??"");
  const [showMyPlayerPicker,setShowMyPlayerPicker]=useState(false);
  const [search,setSearch]=useState("");
  const [leaderKey,setLeaderKey]=useState<"pts"|"reb"|"ast"|"wins">("pts");
  const [players,setPlayers]=useState<Player[]>(()=>loadData("yg-players",initialPlayers));
  const [games,setGames]=useState<Game[]>(()=>normalizeLegacyGames(loadData("yg-games",initialGames)));
  const [awards,setAwards]=useState<Award[]>(()=>loadData("yg-awards",initialAwards));
  const [seasons,setSeasons]=useState(()=>loadData("yg-seasons",initialSeasons));
  const [news,setNews]=useState<NewsStory[]>(()=>loadData("yg-news",initialNews));
  const [runs,setRuns]=useState<SundayRun[]>(()=>loadData("yg-runs",initialRuns));
  const [polls,setPolls]=useState<LeaguePoll[]>(()=>loadData("yg-polls",initialPolls));
  const [history,setHistory]=useState<HistoryEntry[]>(()=>loadData("yg-history",initialHistory));
  const [branding,setBranding]=useState<LeagueBranding>(()=>loadData("yg-branding",initialBranding));
  const [rankings,setRankings]=useState<PowerRankingSnapshot[]>(()=>loadData("yg-rankings",initialRankings));
  const [submissions,setSubmissions]=useState<LeagueSubmission[]>(()=>loadData("yg-submissions",initialSubmissions));
  const [adminTab,setAdminTab]=useState<AdminTab>("dashboard");
  const [toast,setToast]=useState("");
  const [sessionToken,setSessionToken]=useState(()=>sessionStorage.getItem("yg-session")??"");
  const [cloudStatus,setCloudStatus]=useState<"loading"|"cloud"|"local"|"saving"|"error">("loading");
  const [cloudUpdatedAt,setCloudUpdatedAt]=useState<string|null>(null);

  const saveAll=(next?:Partial<LeagueData>)=>{
    const p=next?.players??players,g=next?.games??games,a=next?.awards??awards,se=next?.seasons??seasons,n=next?.news??news,r=next?.runs??runs,po=next?.polls??polls,h=next?.history??history,b=next?.branding??branding,pr=next?.rankings??rankings,su=next?.submissions??submissions;
    localStorage.setItem("yg-players",JSON.stringify(p));localStorage.setItem("yg-games",JSON.stringify(g));localStorage.setItem("yg-awards",JSON.stringify(a));localStorage.setItem("yg-seasons",JSON.stringify(se));localStorage.setItem("yg-news",JSON.stringify(n));localStorage.setItem("yg-runs",JSON.stringify(r));localStorage.setItem("yg-polls",JSON.stringify(po));localStorage.setItem("yg-history",JSON.stringify(h));localStorage.setItem("yg-branding",JSON.stringify(b));localStorage.setItem("yg-rankings",JSON.stringify(pr));localStorage.setItem("yg-submissions",JSON.stringify(su));
    const data={players:p,games:g,awards:a,seasons:se,news:n,runs:r,polls:po,history:h,branding:b,rankings:pr,submissions:su};
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
    const nextNews=data.news??initialNews,nextRuns=data.runs??initialRuns,nextPolls=data.polls??initialPolls,nextHistory=data.history??initialHistory,nextBranding=data.branding??initialBranding,nextRankings=data.rankings??initialRankings,nextSubmissions=data.submissions??initialSubmissions,nextGames=normalizeLegacyGames(data.games);
    setPlayers(data.players);setGames(nextGames);setAwards(data.awards);setSeasons(data.seasons);setNews(nextNews);setRuns(nextRuns);setPolls(nextPolls);setHistory(nextHistory);setBranding(nextBranding);setRankings(nextRankings);setSubmissions(nextSubmissions);
    localStorage.setItem("yg-players",JSON.stringify(data.players));localStorage.setItem("yg-games",JSON.stringify(nextGames));localStorage.setItem("yg-awards",JSON.stringify(data.awards));localStorage.setItem("yg-seasons",JSON.stringify(data.seasons));localStorage.setItem("yg-news",JSON.stringify(nextNews));localStorage.setItem("yg-runs",JSON.stringify(nextRuns));localStorage.setItem("yg-polls",JSON.stringify(nextPolls));localStorage.setItem("yg-history",JSON.stringify(nextHistory));localStorage.setItem("yg-branding",JSON.stringify(nextBranding));localStorage.setItem("yg-rankings",JSON.stringify(nextRankings));localStorage.setItem("yg-submissions",JSON.stringify(nextSubmissions));
  };
  const replaceData=(data:LeagueData)=>{hydrateData(data);saveAll(data);};
  const resetData=()=>{
    if(!confirm("Reset all locally saved changes and restore the original league data?")) return;
    replaceData({players:initialPlayers,games:initialGames,awards:initialAwards,seasons:initialSeasons,news:initialNews,runs:initialRuns,polls:initialPolls,history:initialHistory,branding:initialBranding,rankings:initialRankings,submissions:initialSubmissions});
  };

  const filtered=useMemo(()=>players.filter(p => `${p.name} ${p.nickname}`.toLowerCase().includes(search.toLowerCase())),[search]);
  const ranked=useMemo(()=>[...players].sort((a,b)=>b[leaderKey]-a[leaderKey]),[leaderKey]);
  const pointsLeader=[...players].sort((a,b)=>b.pts-a.pts)[0];
  const reboundsLeader=[...players].sort((a,b)=>b.reb-a.reb)[0];
  const assistsLeader=[...players].sort((a,b)=>b.ast-a.ast)[0];
  const winLeader=[...players].sort((a,b)=>pct(b)-pct(a))[0];
  const finalGames=useMemo(()=>games.filter(isFinal),[games]);
  const scheduledGames=useMemo(()=>games.filter(game=>!isFinal(game)),[games]);
  const latestFinal=finalGames[finalGames.length-1];
  const nextGame=scheduledGames[0];
  const publishedNews=useMemo(()=>news.filter(story=>story.published).sort((a,b)=>Number(b.featured)-Number(a.featured)),[news]);
  const featuredStory=publishedNews[0];
  const orderedRuns=useMemo(()=>[...runs].sort((a,b)=>a.date.localeCompare(b.date)),[runs]);
  const todayKey=new Date().toLocaleDateString("en-CA");
  const nextRun=orderedRuns.find(run=>run.date>=todayKey&&run.status!=="cancelled")??orderedRuns[orderedRuns.length-1];
  const hallOfFame=useMemo(()=>players.filter(player=>hallResume(player,awards).total>=100).sort((a,b)=>hallResume(b,awards).total-hallResume(a,awards).total),[players,awards]);
  const records:RecordItem[]=useMemo(()=>[
    {category:"Career",label:"Most Points",holder:pointsLeader?.name??"—",value:String(pointsLeader?.pts??0),date:"Live shared totals"},
    {category:"Career",label:"Most Rebounds",holder:reboundsLeader?.name??"—",value:String(reboundsLeader?.reb??0),date:"Live shared totals"},
    {category:"Career",label:"Most Assists",holder:assistsLeader?.name??"—",value:String(assistsLeader?.ast??0),date:"Live shared totals"},
    {category:"Career",label:"Best Win Percentage",holder:winLeader?.name??"—",value:`${pct(winLeader)}%`,date:"Minimum one recorded game"},
    {category:"Career",label:"Most Wins",holder:winLeader?.name??"—",value:String(winLeader?.wins??0),date:"Live shared totals"},
    {category:"League",label:"Closest Game",holder:[...finalGames].sort((a,b)=>Math.abs(a.scoreA-a.scoreB)-Math.abs(b.scoreA-b.scoreB))[0]?.title??"—",value:finalGames.length?`${Math.min(...finalGames.map(g=>Math.abs(g.scoreA-g.scoreB)))} points`:"—",date:"Calculated automatically"},
  ],[players,finalGames,pointsLeader,reboundsLeader,assistsLeader,winLeader]);
  const myPlayer=players.find(player=>player.id===myPlayerId);
  const latestRanking=rankings[0]??initialRankings[0];
  const chooseMyPlayer=(id:string)=>{setMyPlayerId(id);if(id)localStorage.setItem("yg-my-player",id);else localStorage.removeItem("yg-my-player");};

  const go=(next:View)=>{ setView(next); window.scrollTo({top:0,behavior:"smooth"}); };
  const openProfile=(player:Player)=>{setSelected(player);go("profile");};
  const shareLeague=async()=>{
    const share={title:"Y's Guys League",text:"Check out the official Y's Guys player stats, Sunday runs and league history.",url:window.location.origin};
    try{if(navigator.share)await navigator.share(share);else{await navigator.clipboard.writeText(window.location.origin);setToast("League link copied");setTimeout(()=>setToast(""),1800)}}catch{}
  };
  const submitRsvp=async(runId:string,rsvp:Omit<RunRsvp,"updatedAt">)=>{
    const response=await fetch("/api/rsvp",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({runId,...rsvp})});
    if(!response.ok){const result=await response.json().catch(()=>({}));throw new Error(result.error||"RSVP could not be saved");}
    const result=await response.json();
    setRuns(result.runs);localStorage.setItem("yg-runs",JSON.stringify(result.runs));
    setCloudUpdatedAt(result.updatedAt);setCloudStatus("cloud");setToast("Sunday response saved for everyone");setTimeout(()=>setToast(""),2200);
  };
  const submitVote=async(pollId:string,voterId:string,nomineeId:string)=>{
    const response=await fetch("/api/vote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({pollId,voterId,nomineeId})});
    if(!response.ok){const result=await response.json().catch(()=>({}));throw new Error(result.error||"Vote could not be saved");}
    const result=await response.json();setPolls(result.polls);localStorage.setItem("yg-polls",JSON.stringify(result.polls));
    setCloudUpdatedAt(result.updatedAt);setCloudStatus("cloud");setToast("Vote saved");setTimeout(()=>setToast(""),1800);
  };
  const submitLeagueItem=async(item:{type:"profile-photo"|"suggestion";playerId:string;message:string;imageUrl?:string})=>{
    const response=await fetch("/api/submissions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(item)});
    if(!response.ok){const result=await response.json().catch(()=>({}));throw new Error(result.error||"Submission could not be saved");}
    const result=await response.json();setSubmissions(result.submissions);localStorage.setItem("yg-submissions",JSON.stringify(result.submissions));
    setCloudUpdatedAt(result.updatedAt);setCloudStatus("cloud");setToast(item.type==="profile-photo"?"Photo sent for Commissioner approval":"Suggestion sent to the Commissioner");setTimeout(()=>setToast(""),2400);
  };

  useEffect(()=>{
    const controller=new AbortController();
    fetch("/api/league",{signal:controller.signal}).then(async response=>{if(!response.ok)throw new Error();return response.json()}).then(result=>{
      if(result.data){
        const data=result.data as LeagueData;
        hydrateData(data);
      }
      setCloudUpdatedAt(result.updatedAt);setCloudStatus("cloud");
    }).catch(error=>{if(error?.name!=="AbortError")setCloudStatus("local")});
    return ()=>controller.abort();
  },[]);

  return <div className="app"><style>{styles}</style>
    <header className="topbar">
      <button className="brand" onClick={()=>go("home")}><img className="brandMark" src={branding.logoUrl||initialBranding.logoUrl} alt=""/><span><b>{branding.wordmark}</b><small>{branding.tagline} · v4.9</small></span></button>
      <div className="headerActions"><button className="myPlayerPill" onClick={()=>setShowMyPlayerPicker(true)}>{myPlayer?<>{myPlayer.photoUrl?<img className="avatar photoAvatar" src={myPlayer.photoUrl} alt=""/>:<span className="avatar">{initials(myPlayer.name)}</span>}<b>{myPlayer.name}</b></>:<>◎ <b>My Player</b></>}</button><button className="seasonPill" onClick={()=>go("hof")}><span className={`syncDot ${cloudStatus}`}/>{cloudStatus==="cloud"?"Shared":"Offline"} · Summer 2026</button></div>
    </header>

    <main>
      {view==="home" && <>
        <section className="hero">
          <div><span className="live"><i/>SEASON ACTIVE · CLOUD SYNC</span><h1>The official home of Y's Guys.</h1><p>Sunday availability, league news, player rankings and history—preserved in one shared place.</p><div className="heroActions"><button onClick={()=>go("attendance")}>Sunday RSVP</button><button className="ghost" onClick={()=>go("hof")}>Open Hall</button><button className="ghost" onClick={shareLeague}>Share league</button></div></div>
          <div className="heroScore">{nextGame?<><small>NEXT GAME</small><b>{nextGame.startTime||"TBD"}</b><span>{nextGame.teamA} vs {nextGame.teamB}<br/>{nextGame.date}{nextGame.location?` · ${nextGame.location}`:""}</span></>:latestFinal?<><small>LATEST FINAL</small><b>{latestFinal.scoreA}–{latestFinal.scoreB}</b><span>{latestFinal.scoreA>latestFinal.scoreB?latestFinal.teamA:latestFinal.teamB} over {latestFinal.scoreA>latestFinal.scoreB?latestFinal.teamB:latestFinal.teamA}</span></>:<><small>GAME DAY</small><b>—</b><span>No games recorded yet</span></>}</div>
          <img className="heroWatermark" src={branding.logoUrl||initialBranding.logoUrl} alt=""/>
        </section>
        {nextRun&&<QuickRsvp run={nextRun} myPlayer={myPlayer} updatedAt={cloudUpdatedAt} onChoosePlayer={()=>setShowMyPlayerPicker(true)} onSubmit={submitRsvp}/>}
        {myPlayer&&<button className="myPlayerHome" onClick={()=>openProfile(myPlayer)}>{myPlayer.photoUrl?<img src={myPlayer.photoUrl} alt=""/>:<span>{overallRating(myPlayer)}</span>}<div><small>MY PLAYER</small><h2>{myPlayer.name}</h2><p>{myPlayer.wins}-{myPlayer.losses} · {avg(myPlayer.pts,myPlayer)} PPG · {hallProgress(hallResume(myPlayer,awards).total)}% Hall Progress</p></div><b>Open profile →</b></button>}

        <div className="twoCol">
          <section className="panel newsPanel"><Section title="League news" eyebrow="HEADLINES" />
            <UpdatedStamp value={cloudUpdatedAt} label="News"/>
            {featuredStory?<><article className={`featureNews ${featuredStory.imageUrl?"withImage":""}`} style={featuredStory.imageUrl?{backgroundImage:`linear-gradient(90deg,rgba(5,25,54,.94),rgba(5,25,54,.48)),url("${featuredStory.imageUrl}")`}:undefined}><span>{featuredStory.category}</span><h3>{featuredStory.headline}</h3><p>{featuredStory.summary}</p><button onClick={()=>go("community")}>Open Community →</button></article>
            {publishedNews.slice(1,3).map(story=><article className="newsRow" key={story.id}><b>{story.category}</b><span>{story.headline}</span></article>)}</>:<div className="emptyNews">No community stories are published yet.</div>}
          </section>
          <PowerRankings snapshot={latestRanking} players={players} onOpen={openProfile}/>
        </div>
      </>}

      {view==="attendance" && <AttendanceCenter runs={orderedRuns} players={players} defaultPlayerId={myPlayerId} onSubmit={submitRsvp}/>}
      {view==="timeline" && <LeagueTimeline games={games} awards={awards} news={news} runs={runs} history={history}/>}
      {view==="voting" && <VotingCenter polls={polls} players={players} defaultPlayerId={myPlayerId} onVote={submitVote}/>}
      {view==="studio" && <SuggestionBox players={players} defaultPlayerId={myPlayerId} onSubmit={submitLeagueItem}/>}

      {view==="community" && <Page eyebrow="THE COMMUNITY · v4.0" title="More than a box score." subtitle="Stories, announcements and moments from around the Y's Guys universe.">
        {publishedNews.length?<div className="communityGrid">{publishedNews.map((story,index)=><article className={index===0?"communityStory featured":"communityStory"} key={story.id}>{story.imageUrl?<img src={story.imageUrl} alt=""/>:<div className="storyFallback">YG</div>}<div><span>{story.category} · {story.date}</span><h2>{story.headline}</h2><p>{story.summary}</p>{story.featured&&<b>FEATURED STORY</b>}</div></article>)}</div>:<div className="communityEmpty"><span>📰</span><h2>The newsroom is ready.</h2><p>The Commissioner can publish the first community story from Commissioner Mode.</p></div>}
      </Page>}

      {view==="games" && <Page eyebrow="GAME DAY · v2.8" title="Schedule and results." subtitle="Upcoming matchups and complete results from the active season.">
        {scheduledGames.length>0&&<><Section eyebrow="UP NEXT" title="Upcoming games"/><div className="upcomingList">{scheduledGames.map(g=><article className="upcomingCard" key={g.id}><div><span>{g.date}{g.startTime?` · ${g.startTime}`:""}</span><h3>{g.teamA} <em>vs</em> {g.teamB}</h3><p>{g.title}{g.location?` · ${g.location}`:""}</p></div><b>SCHEDULED</b></article>)}</div></>}
        <Section eyebrow="FINAL SCORES" title="Game history"/>
        <div className="gameList">{finalGames.map((g,i)=><article className="gameCard" key={g.id}><div className="gameTop"><span>{g.date}{g.location?` · ${g.location}`:""}</span><b>{i===finalGames.length-1?"LATEST":"FINAL"}</b></div><h3>{g.title}</h3><div className={g.scoreA<g.scoreB?"scoreLine loser":"scoreLine"}><span>{g.teamA}</span><strong>{g.scoreA}</strong></div><div className={g.scoreB<g.scoreA?"scoreLine loser":"scoreLine"}><span>{g.teamB}</span><strong>{g.scoreB}</strong></div>{g.mvp&&<div className="mvp">⭐ Player of the Game: <b>{g.mvp}</b></div>}<p>{g.recap}</p>{g.boxScore?.length?<details className="boxScorePublic"><summary>Open box score</summary><div className="publicStatHead"><b>Player</b><span>PTS</span><span>REB</span><span>AST</span><span>TO</span></div>{g.boxScore.map(line=><div className="publicStatRow" key={line.playerId}><b>{players.find(p=>p.id===line.playerId)?.name??"Player"}</b><span>{line.pts}</span><span>{line.reb}</span><span>{line.ast}</span><span>{line.turnovers}</span></div>)}</details>:null}</article>)}</div>
      </Page>}

      {view==="players" && <Page eyebrow="PLAYER DIRECTORY" title="The people who built the league." subtitle="Search the roster and open any profile.">
        <input className="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search players or nicknames…" />
        <div className="playerGrid">{filtered.map(p=><button className="playerCard" key={p.id} onClick={()=>openProfile(p)}><div className="playerCardTop">{p.photoUrl?<img className="playerThumb" src={p.photoUrl} alt={`${p.name} profile`}/>:<span className="playerPhotoPlaceholder">{initials(p.name)}</span>}<span className="bigAvatar">{overallRating(p)}<small>OVR</small></span></div><span className="pos">{p.jerseyNumber?`#${p.jerseyNumber} · `:""}{p.position}</span><h3>{p.name}</h3><small>“{p.nickname}” · {archetype(p)}</small><div className="miniStats"><span><b>{avg(p.pts,p)}</b>PPG</span><span><b>{avg(p.reb,p)}</b>RPG</span><span><b>{avg(p.ast,p)}</b>APG</span></div><div className="record">{p.wins}-{p.losses} · {hallProgress(hallResume(p,awards).total)}% Hall Progress</div></button>)}</div>
      </Page>}

      {view==="profile" && selected && <PlayerUniverseProfile player={selected} games={games} officialAwards={awards} rank={players.slice().sort((a,b)=>overallRating(b)-overallRating(a)).findIndex(p=>p.id===selected.id)+1} isMyPlayer={selected.id===myPlayerId} onPhotoSubmit={submitLeagueItem} onBack={()=>go("players")}/>}

      {view==="compare" && <PlayerComparison players={players} awards={awards}/>}

      {view==="leaders" && <Page eyebrow="LEAGUE LEADERS" title="See who sets the pace." subtitle="Current totals through July 26, 2026.">
        <div className="chips">{([['pts','PTS'],['reb','REB'],['ast','AST'],['wins','WINS']] as const).map(([k,l])=><button className={leaderKey===k?"active":""} onClick={()=>setLeaderKey(k)} key={k}>{l}</button>)}</div>
        <section className="chart"><ResponsiveContainer width="100%" height={420}><BarChart data={ranked} layout="vertical" margin={{left:10,right:24}}><CartesianGrid strokeDasharray="3 3" horizontal={false}/><XAxis type="number" hide/><YAxis type="category" dataKey="name" width={76} tick={{fontSize:12,fontWeight:700,fill:NAVY}} axisLine={false} tickLine={false}/><Tooltip/><Bar dataKey={leaderKey} fill={NAVY} radius={[0,8,8,0]}/></BarChart></ResponsiveContainer></section>
      </Page>}

      {view==="records" && <Page eyebrow="THE ARCHIVE" title="Y's Guys Record Book" subtitle="The marks everyone is chasing.">
        <div className="recordHero"><span>🏆</span><div><small>LIVE FEATURED RECORD</small><h2>{winLeader.name} · Best Win Percentage</h2><p>{pct(winLeader)}% across {gp(winLeader)} games</p></div></div>
        <div className="recordGrid">{records.map((r,i)=><article className="recordCard" key={i}><span>{r.category}</span><h3>{r.label}</h3><strong>{r.value}</strong><b>{r.holder}</b><small>{r.date}</small></article>)}</div>
        <PlayerAnalytics players={players} games={games}/>
        <div className="note">Version 2.6 recalculates this record book whenever shared player or game data changes.</div>
      </Page>}

      {view==="awards" && <Page eyebrow="TROPHY ROOM" title="Awards Center" subtitle="Celebrating the players who shaped each season.">
        <div className="awardBanner"><div>2025</div><span>OFFICIAL AWARD CLASS</span></div>
        <div className="awardGrid">{awards.map(a=><article className="awardCard" key={a.name}><span>{a.icon}</span><small>{a.season}</small><h3>{a.name}</h3><b>{a.winner}</b></article>)}</div>
      </Page>}

      {view==="seasons" && <Page eyebrow="SEASON ARCHIVE" title="Choose an era." subtitle="Every season will keep its own games, leaders, awards and champion.">
        <div className="seasonList">{seasons.map(s=><article className="seasonCard" key={s.name}><div><span className={s.status==="Active"?"status active":"status"}>{s.status}</span><h3>{s.name}</h3><p>{s.games} recorded games · Champion: {s.champion}</p></div><button onClick={()=>go("home")}>Open →</button></article>)}</div>
      </Page>}

      {view==="calendar" && <CalendarView games={games} runs={runs}/>}

      {view==="rules" && <RuleBook/>}

      {view==="hof" && <HallHub players={players} awards={awards} seasons={seasons} records={records} updatedAt={cloudUpdatedAt} onOpen={openProfile}/>}

      {view==="commissioner" && <Page eyebrow="COMMISSIONER MODE · v4.0" title="Run the entire league universe." subtitle="Publish games, profiles, photos and community stories for every visitor.">
        {!sessionToken?<CommissionerLogin onLogin={(token)=>{sessionStorage.setItem("yg-session",token);setSessionToken(token);setCloudStatus("saving");fetch("/api/league",{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({data:{players,games,awards,seasons,news,runs,polls,history,branding,rankings,submissions}})}).then(async response=>{if(!response.ok)throw new Error();const result=await response.json();setCloudUpdatedAt(result.updatedAt);setCloudStatus("cloud");setToast("Commissioner unlocked · league published");}).catch(()=>{setCloudStatus("error");setToast("Unlocked · first cloud save needs retry");}).finally(()=>setTimeout(()=>setToast(""),2400))}}/>:<>
        <div className="commissionerStatus"><div><span className={`syncDot ${cloudStatus}`}/><b>{cloudStatus==="saving"?"Saving…":cloudStatus==="cloud"?"Cloud connected":"Cloud attention needed"}</b><small>{cloudUpdatedAt?`Last cloud update ${new Date(cloudUpdatedAt).toLocaleString()}`:"Ready to create the first shared revision"}</small></div><button onClick={()=>{sessionStorage.removeItem("yg-session");setSessionToken("")}}>Lock Commissioner Mode</button></div>
        <div className="adminTabs">
          {([['dashboard','Command Center'],['review',`Review Center (${submissions.filter(item=>item.status==="pending").length})`],['rankings','Power Rankings'],['runs','Sunday Runs'],['games','Game Data'],['players','Add / Edit Players'],['history','Add History'],['news','Community News'],['polls','Voting'],['awards','Awards'],['branding','League Branding'],['data','Backups']] as const).map(([k,l])=><button key={k} className={adminTab===k?'active':''} onClick={()=>setAdminTab(k)}>{l}</button>)}
        </div>
        {adminTab==='dashboard' && <CommissionerDashboard players={players} games={games} runs={runs} news={news} polls={polls} history={history} onOpen={setAdminTab}/>}
        {adminTab==='review' && <ReviewCenter submissions={submissions} players={players} onChange={(next,nextPlayers)=>{setSubmissions(next);if(nextPlayers)setPlayers(nextPlayers);saveAll({submissions:next,players:nextPlayers??players});}}/>}
        {adminTab==='rankings' && <PowerRankingManager rankings={rankings} players={players} onChange={(next)=>{setRankings(next);saveAll({rankings:next});}}/>}
        {adminTab==='runs' && <RunManager runs={runs} onChange={(next)=>{setRuns(next);saveAll({runs:next});}} onConvert={(run)=>{if(games.some(game=>game.id===`game-${run.id}`))return alert("A scheduled game already exists for this Sunday.");const game:Game={id:`game-${run.id}`,date:formatRunDate(run.date),startTime:run.startTime,location:run.location,status:"scheduled",title:run.title,teamA:"Side A",scoreA:0,teamB:"Side B",scoreB:0,mvp:"",recap:""};const next=[...games,game];setGames(next);saveAll({games:next});setToast("Sunday added to scheduled games");setTimeout(()=>setToast(""),2000)}}/>}
        {adminTab==='games' && <GameManager games={games} players={players} onSave={(game,previous)=>{const nextGames=previous?games.map(g=>g.id===game.id?game:g):[...games,game];const nextPlayers=applyBoxScoreDelta(players,previous,game);setGames(nextGames);setPlayers(nextPlayers);saveAll({games:nextGames,players:nextPlayers});}} onDelete={(game)=>{const nextGames=games.filter(g=>g.id!==game.id);const nextPlayers=applyBoxScoreDelta(players,game,undefined);setGames(nextGames);setPlayers(nextPlayers);saveAll({games:nextGames,players:nextPlayers});}}/>}
        {adminTab==='players' && <PlayerManager players={players} onChange={(next)=>{setPlayers(next);saveAll({players:next});}}/>}
        {adminTab==='history' && <HistoryManager history={history} onChange={(next)=>{setHistory(next);saveAll({history:next});}}/>}
        {adminTab==='news' && <NewsManager news={news} onChange={(next)=>{setNews(next);saveAll({news:next});}}/>}
        {adminTab==='polls' && <PollManager polls={polls} players={players} onChange={(next)=>{setPolls(next);saveAll({polls:next});}}/>}
        {adminTab==='awards' && <AwardManager awards={awards} players={players} onChange={(next)=>{setAwards(next);saveAll({awards:next});}}/>}
        {adminTab==='branding' && <BrandManager branding={branding} onChange={(next)=>{setBranding(next);saveAll({branding:next});}}/>}
        {adminTab==='data' && <DataTools data={{players,games,awards,seasons,news,runs,polls,history,branding,rankings,submissions}} sessionToken={sessionToken} onImport={replaceData} onCloudRestore={(data,updatedAt)=>{hydrateData(data);setCloudUpdatedAt(updatedAt);setCloudStatus("cloud");setToast("Cloud revision restored");setTimeout(()=>setToast(""),2000)}} onReset={resetData}/>}
        </>}
      </Page>}

      {view==="more" && <Page eyebrow="LEAGUE UNIVERSE · v4.9" title="More from Y's Guys" subtitle="A cleaner home for league stories, ideas and history."><div className="menuList"><Menu label="Community News" icon="📰" onClick={()=>go("community")}/><Menu label="Suggestion Box" icon="💡" onClick={()=>go("studio")}/><Menu label="Rule Book" icon="📖" onClick={()=>go("rules")}/><Menu label="League History" icon="🗓️" onClick={()=>go("timeline")}/><Menu label="Sunday MVP Voting" icon="🗳️" onClick={()=>go("voting")}/><Menu label="Share League" icon="↗️" onClick={shareLeague}/><Menu label="Commissioner Mode" icon="🔒" onClick={()=>go("commissioner")}/></div></Page>}
    </main>

    {toast && <div className="toast">✓ {toast}</div>}
    {showMyPlayerPicker&&<MyPlayerPicker players={players} selectedId={myPlayerId} onSelect={(id)=>{chooseMyPlayer(id);setShowMyPlayerPicker(false)}} onClose={()=>setShowMyPlayerPicker(false)}/>}
    <nav className="bottomNav">
      <Nav label="Home" icon="⌂" active={view==="home"} onClick={()=>go("home")}/><Nav label="Sunday" icon="✓" active={view==="attendance"} onClick={()=>go("attendance")}/><Nav label="Hall" icon="♛" active={view==="hof"} onClick={()=>go("hof")}/><Nav label="Profiles" icon="◎" active={["players","profile","compare"].includes(view)} onClick={()=>go("players")}/><Nav label="More" icon="•••" active={["more","community","timeline","voting","studio","rules","commissioner"].includes(view)} onClick={()=>go("more")}/>
    </nav>

  </div>
}

function UpdatedStamp({value,label}:{value:string|null;label:string}){
  return <small className="updatedStamp">{label} updated {value?new Date(value).toLocaleString():"with the latest shared data"}</small>;
}

function QuickRsvp({run,myPlayer,updatedAt,onChoosePlayer,onSubmit}:{run:SundayRun;myPlayer?:Player;updatedAt:string|null;onChoosePlayer:()=>void;onSubmit:(runId:string,rsvp:Omit<RunRsvp,"updatedAt">)=>Promise<void>}){
  const [saving,setSaving]=useState(false);
  const current=myPlayer?run.rsvps.find(item=>item.playerId===myPlayer.id):undefined;
  const choose=async(status:RsvpStatus)=>{if(!myPlayer)return onChoosePlayer();setSaving(true);try{await onSubmit(run.id,{playerId:myPlayer.id,status,arrivalTime:current?.arrivalTime,note:current?.note})}finally{setSaving(false)}};
  return <section className="quickRsvp"><div><span>NEXT SUNDAY RUN</span><h2>{formatRunDate(run.date)}</h2><p>{run.startTime} · {run.location}</p><UpdatedStamp value={updatedAt} label="Attendance"/></div><div className="quickChoices">{(["going","maybe","out"] as const).map(status=><button disabled={saving} className={current?.status===status?"active":""} key={status} onClick={()=>choose(status)}>{status==="going"?"✓ IN":status==="maybe"?"? MAYBE":"× OUT"}</button>)}</div>{!myPlayer&&<button className="choosePlayerLink" onClick={onChoosePlayer}>Choose My Player first</button>}</section>;
}

function PowerRankings({snapshot,players,onOpen}:{snapshot:PowerRankingSnapshot;players:Player[];onOpen:(player:Player)=>void}){
  return <section className="panel powerPanel"><Section title="Power Rankings" eyebrow={`WEEK ${snapshot.week}`}/><UpdatedStamp value={snapshot.publishedAt} label="Rankings"/><div className="powerList">{snapshot.entries.map((entry,index)=>{const player=players.find(item=>item.id===entry.playerId);return <button key={`${entry.playerName}-${index}`} onClick={()=>player&&onOpen(player)} disabled={!player}><span className="powerRank">{entry.dnp?"T-15":entry.rank}</span>{player?.photoUrl?<img src={player.photoUrl} alt=""/>:<span className="avatar">{initials(entry.playerName)}</span>}<span className="powerIdentity"><b>{entry.playerName}</b><small>{entry.reason}</small></span><strong className={(entry.movement??0)>0?"moveUp":(entry.movement??0)<0?"moveDown":"moveEven"}>{entry.dnp?"DNP":(entry.movement??0)>0?`▲ ${entry.movement}`:(entry.movement??0)<0?`▼ ${Math.abs(entry.movement??0)}`:"—"}</strong></button>})}</div></section>;
}

function HallHub({players,awards,seasons,records,updatedAt,onOpen}:{players:Player[];awards:Award[];seasons:typeof initialSeasons;records:RecordItem[];updatedAt:string|null;onOpen:(player:Player)=>void}){
  const eligible=players.filter(player=>hallResume(player,awards).total>=100);
  const banners=players.flatMap(player=>hallResume(player,awards).milestones.map(item=>({player,item})));
  return <Page eyebrow="THE HALL · FORMULA V1" title="Records, banners and immortality." subtitle="The complete league archive in one place. Only awards, milestones and wins build Hall Progress.">
    <UpdatedStamp value={updatedAt} label="Hall Progress"/>
    <div className="hallJump"><a href="#hall-progress">Hall of Fame</a><a href="#record-book">Record Book</a><a href="#banner-hall">Banner Hall</a><a href="#awards-hall">Awards</a><a href="#season-hall">Seasons</a></div>
    <section id="hall-progress"><Section eyebrow="100% TO QUALIFY" title="Hall of Fame Progress"/>{eligible.length?<div className="hallGrid">{eligible.map(player=><button className="hallCard" key={player.id} onClick={()=>onOpen(player)}><span>🏛️</span><small>ELIGIBLE FOR INDUCTION</small><h3>{player.name}</h3><b>100% Hall Progress</b></button>)}</div>:<div className="hallEmpty"><span>🏛️</span><h2>No shortcuts to immortality.</h2><p>No player has reached the 100% eligibility standard yet.</p></div>}<div className="legacyTracker">{players.slice().sort((a,b)=>hallResume(b,awards).total-hallResume(a,awards).total).map((player,index)=>{const resume=hallResume(player,awards),progress=hallProgress(resume.total);return <button key={player.id} onClick={()=>onOpen(player)}><span>{index+1}</span><div><b>{player.name}</b><small>{resume.status} · {progress}% complete</small><i><em style={{width:`${progress}%`}}/></i></div><strong>{progress}%</strong></button>})}</div></section>
    <section id="record-book"><Section eyebrow="LIVE CAREER MARKS" title="Record Book"/><div className="recordGrid">{records.map((record,index)=><article className="recordCard" key={`${record.label}-${index}`}><span>{record.category}</span><h3>{record.label}</h3><strong>{record.value}</strong><b>{record.holder}</b><small>{record.date}</small></article>)}</div></section>
    <section id="banner-hall"><Section eyebrow="MILESTONES EARNED" title="Banner Hall"/>{banners.length?<div className="milestoneBannerGrid">{banners.map(({player,item})=><article className="milestoneBanner" key={`${player.id}-${item.category}-${item.threshold}`}><span>★</span><div><small>{player.name.toUpperCase()}</small><b>{item.banner}</b><em>{item.threshold.toLocaleString()} {item.category.replace("Career ","")} · +{item.hallPoints}%</em></div></article>)}</div>:<div className="empty">The first career milestone banner is still waiting to be raised.</div>}</section>
    <section id="awards-hall"><Section eyebrow="OFFICIAL HONORS" title="Awards"/><div className="awardGrid">{awards.map((award,index)=><article className="awardCard" key={`${award.season}-${award.name}-${index}`}><span>{award.icon}</span><small>{award.season}</small><h3>{award.name}</h3><b>{award.winner}</b></article>)}</div></section>
    <section id="season-hall"><Section eyebrow="LEAGUE ERAS" title="Season Archive"/><div className="seasonList">{seasons.map(season=><article className="seasonCard" key={season.name}><div><span className={season.status==="Active"?"status active":"status"}>{season.status}</span><h3>{season.name}</h3><p>{season.games} recorded games · Champion: {season.champion}</p></div></article>)}</div></section>
  </Page>;
}

function PlayerUniverseProfile({player,games,officialAwards,rank,isMyPlayer,onPhotoSubmit,onBack}:{player:Player;games:Game[];officialAwards:Award[];rank:number;isMyPlayer:boolean;onPhotoSubmit:(item:{type:"profile-photo"|"suggestion";playerId:string;message:string;imageUrl?:string})=>Promise<void>;onBack:()=>void}){
  const honors=[...new Set([...player.awards,...officialAwards.filter(a=>a.winner.toLowerCase()===player.name.toLowerCase()).map(a=>`${a.season} ${a.name}`)])];
  const logs=games.filter(game=>game.boxScore?.some(line=>line.playerId===player.id)).map(game=>({game,line:game.boxScore!.find(line=>line.playerId===player.id)!}));
  const rating=overallRating(player),resume=hallResume(player,officialAwards),progress=hallProgress(resume.total);
  return <><button className="backButton" onClick={onBack}>← All profiles</button><section className="universeHero" style={player.bannerColor?{background:`linear-gradient(135deg,#071c3e,${player.bannerColor})`}:undefined}>{player.photoUrl?<div className="profilePhotoWrap"><img src={player.photoUrl} alt={`${player.name} profile`}/><b>{rating} OVR</b></div>:<div className="ratingOrb"><strong>{rating}</strong><small>OVR</small></div>}<div className="universeIdentity"><span>{player.jerseyNumber?`#${player.jerseyNumber} · `:""}{player.position}{player.height?` · ${player.height}`:""} · {archetype(player)}</span><h1>{player.name}</h1><p>“{player.nickname}”</p><div className="profileTags"><b>#{rank} OVERALL</b><b>{player.wins}-{player.losses} RECORD</b><b>{pct(player)}% WIN</b>{player.overallOverride!==undefined&&<b>COMMISSIONER OVR</b>}{player.signatureBadge&&<b>⭐ {player.signatureBadge}</b>}</div></div><div className="legacyMeter"><div><strong>{progress}%</strong><small>HALL PROGRESS</small></div><span><i style={{width:`${progress}%`}}/></span><p>{resume.status}{progress<100?` · ${100-progress}% remaining`:" · Eligible for induction"}</p></div></section>
  <div className="profileUniverseGrid"><section className="profilePanel"><Section eyebrow="PLAYER DNA" title="Attribute overview"/>{[["Scoring",Math.min(99,Math.round(60+avg(player.pts,player)*4))],["Rebounding",Math.min(99,Math.round(60+avg(player.reb,player)*4))],["Playmaking",Math.min(99,Math.round(60+avg(player.ast,player)*6))],["Winning",Math.min(99,Math.round(55+pct(player)*.44))]].map(([label,value])=><div className="attributeRow" key={label}><b>{label}</b><span><i style={{width:`${value}%`}}/></span><strong>{value}</strong></div>)}<p className="bio">{player.bio}</p></section>
  <section className="profilePanel"><Section eyebrow="TROPHY CASE" title="Awards & honors"/>{honors.length?honors.map(honor=><div className="profileHonor" key={honor}><span>🏆</span><b>{honor}</b></div>):<div className="empty">No official honors recorded yet.</div>}{player.strengths&&<><h4>Signature strengths</h4><p className="bio">{player.strengths}</p></>}</section></div>
  {isMyPlayer&&<PhotoSubmission player={player} onSubmit={onPhotoSubmit}/>}
  <section className="profilePanel badgePanel"><Section eyebrow="" title="Player badges"/><div className="badgeGrid">{playerBadges(player).map(badge=><article className={`playerBadge ${badge.level.toLowerCase()}`} key={badge.name}><span>{badge.icon}</span><div><b>{badge.name}</b><small>{badge.level} badge</small></div></article>)}</div></section>
  <section className="profilePanel hallResumePanel"><Section eyebrow="FORMULA V1 · 100% TO QUALIFY" title="Hall of Fame résumé"/><div className="hallSummary"><span><b>{resume.milestonePoints}</b>Milestone points</span><span><b>{resume.awardPoints}</b>Award points</span><span><b>{progress}%</b>Hall Progress</span></div>{resume.milestones.length?<div className="milestoneBannerGrid">{resume.milestones.map(item=><article className="milestoneBanner" key={`${item.category}-${item.threshold}`}><span>★</span><div><small>{item.category.toUpperCase()}</small><b>{item.banner}</b><em>{item.threshold.toLocaleString()} reached · +{item.hallPoints} Hall Points</em></div></article>)}</div>:<div className="empty">The first career milestone banner is still ahead.</div>}{resume.officialAwards.length>0&&<div className="hallLedger"><h3>Award points</h3>{resume.officialAwards.map((award,index)=><div key={`${award.season}-${award.name}-${index}`}><span>{award.season} · {award.name}</span><b>+{award.hallPoints}</b></div>)}</div>}</section>
  <section className="profilePanel profileGameLog"><Section eyebrow="CAREER LOG" title="Recorded box scores"/>{logs.length?<><div className="logHead"><b>Game</b><span>PTS</span><span>REB</span><span>AST</span><span>TO</span></div>{logs.map(({game,line})=><div className="logRow" key={game.id}><div><b>{game.title}</b><small>{game.date} · {line.team}</small></div><span>{line.pts}</span><span>{line.reb}</span><span>{line.ast}</span><span>{line.turnovers}</span></div>)}</>:<div className="empty">Future Game Day box scores will appear here automatically.</div>}</section></>;
}

function PlayerComparison({players,awards}:{players:Player[];awards:Award[]}){
  const [leftId,setLeftId]=useState(players[0]?.id??"");
  const [rightId,setRightId]=useState(players[1]?.id??players[0]?.id??"");
  const left=players.find(p=>p.id===leftId)??players[0],right=players.find(p=>p.id===rightId)??players[1]??players[0];
  const rows=[
    ["Overall",overallRating(left),overallRating(right)],
    ["Hall Progress",hallProgress(hallResume(left,awards).total),hallProgress(hallResume(right,awards).total)],
    ["Win %",pct(left),pct(right)],
    ["PPG",avg(left.pts,left),avg(right.pts,right)],
    ["RPG",avg(left.reb,left),avg(right.reb,right)],
    ["APG",avg(left.ast,left),avg(right.ast,right)],
    ["Awards",left.awards.length,right.awards.length],
  ] as const;
  return <Page eyebrow="COLLECTOR SERIES · v4.9" title="Compare player cards." subtitle="Flip each card for official awards, career totals, banners and Hall Progress."><div className="compareSelectors"><label>Player one<select value={leftId} onChange={e=>setLeftId(e.target.value)}>{players.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label><span>VS</span><label>Player two<select value={rightId} onChange={e=>setRightId(e.target.value)}>{players.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></label></div><section className="compareHero"><CompareIdentity player={left} awards={awards}/><div className="versus">VS</div><CompareIdentity player={right} awards={awards}/></section><section className="comparisonTable"><div className="comparisonHead"><b>{left.name}</b><span>CATEGORY</span><b>{right.name}</b></div>{rows.map(([label,a,b])=><div className="comparisonRow" key={label}><strong className={a>b?"winner":""}>{a}{label==="Win %"||label==="Hall Progress"?"%":""}</strong><span>{label}</span><strong className={b>a?"winner":""}>{b}{label==="Win %"||label==="Hall Progress"?"%":""}</strong></div>)}</section></Page>;
}

function PhotoSubmission({player,onSubmit}:{player:Player;onSubmit:(item:{type:"profile-photo"|"suggestion";playerId:string;message:string;imageUrl?:string})=>Promise<void>}){
  const [imageUrl,setImageUrl]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");
  const choose=async(file?:File)=>{if(!file)return;try{setError("");setImageUrl(await compressImage(file))}catch(error){setError(error instanceof Error?error.message:"Photo could not be prepared")}};
  const send=async()=>{if(!imageUrl)return;setBusy(true);setError("");try{await onSubmit({type:"profile-photo",playerId:player.id,message:`Profile photo request for ${player.name}`,imageUrl});setImageUrl("")}catch(error){setError(error instanceof Error?error.message:"Photo could not be sent")}finally{setBusy(false)}};
  return <section className="profilePanel photoSubmit"><Section eyebrow="MY PLAYER" title="Submit a profile picture"/><p>Your picture stays private until the Commissioner approves it.</p>{imageUrl&&<img src={imageUrl} alt="Photo preview"/>}<label className="uploadButton">Choose picture<input type="file" accept="image/*" onChange={event=>choose(event.target.files?.[0])}/></label><button className="primary" disabled={!imageUrl||busy} onClick={send}>{busy?"Sending…":"Send for approval"}</button>{error&&<p className="formError">{error}</p>}</section>;
}

function SuggestionBox({players,defaultPlayerId,onSubmit}:{players:Player[];defaultPlayerId:string;onSubmit:(item:{type:"profile-photo"|"suggestion";playerId:string;message:string;imageUrl?:string})=>Promise<void>}){
  const [playerId,setPlayerId]=useState(defaultPlayerId||players[0]?.id||"");const [message,setMessage]=useState("");const [imageUrl,setImageUrl]=useState("");const [busy,setBusy]=useState(false);const [done,setDone]=useState(false);const [error,setError]=useState("");
  const choose=async(file?:File)=>{if(!file)return;try{setImageUrl(await compressImage(file));setError("")}catch(error){setError(error instanceof Error?error.message:"Picture could not be prepared")}};
  const send=async()=>{if(!playerId||message.trim().length<3)return setError("Add your name and a short idea.");setBusy(true);setError("");try{await onSubmit({type:"suggestion",playerId,message:message.trim(),imageUrl:imageUrl||undefined});setMessage("");setImageUrl("");setDone(true)}catch(error){setError(error instanceof Error?error.message:"Suggestion could not be sent")}finally{setBusy(false)}};
  return <Page eyebrow="PRIVATE INBOX · v4.9" title="Suggestion Box" subtitle="Send an idea, correction or picture directly to the Commissioner. Nothing appears publicly unless the Commissioner chooses to use it."><section className="suggestionCard">{done&&<div className="successNote">✓ Your suggestion is in the Commissioner Review Center.</div>}<label>Your player profile<select value={playerId} onChange={event=>setPlayerId(event.target.value)}>{players.map(player=><option value={player.id} key={player.id}>{player.name}</option>)}</select></label><label>Suggestion, idea or correction<textarea value={message} onChange={event=>setMessage(event.target.value)} maxLength={1200} placeholder="What should be added, corrected or remembered?"/></label><label className="uploadButton">Add one optional picture<input type="file" accept="image/*" onChange={event=>choose(event.target.files?.[0])}/></label>{imageUrl&&<div className="suggestionPreview"><img src={imageUrl} alt="Suggestion preview"/><button onClick={()=>setImageUrl("")}>Remove</button></div>}<p className="privacyNote">Pictures are compressed before upload. Video is not accepted in Version 4.9.</p><button className="primary" disabled={busy} onClick={send}>{busy?"Sending…":"Send privately"}</button>{error&&<p className="formError">{error}</p>}</section></Page>;
}

function ReviewCenter({submissions,players,onChange}:{submissions:LeagueSubmission[];players:Player[];onChange:(next:LeagueSubmission[],nextPlayers?:Player[])=>void}){
  const pending=submissions.filter(item=>item.status==="pending");
  const act=(item:LeagueSubmission,status:LeagueSubmission["status"])=>{let nextPlayers:Player[]|undefined;if(status==="approved"&&item.type==="profile-photo"&&item.imageUrl)nextPlayers=players.map(player=>player.id===item.playerId?{...player,photoUrl:item.imageUrl}:player);onChange(submissions.map(entry=>entry.id===item.id?{...entry,status}:entry),nextPlayers)};
  const remove=(id:string)=>onChange(submissions.filter(item=>item.id!==id));
  return <section className="adminCard"><Section eyebrow={`${pending.length} PENDING`} title="Commissioner Review Center"/>{pending.length?pending.map(item=>{const player=players.find(entry=>entry.id===item.playerId);return <article className="reviewItem" key={item.id}>{item.imageUrl&&<img src={item.imageUrl} alt="Submitted"/>}<div><small>{item.type==="profile-photo"?"PROFILE PHOTO":"SUGGESTION"} · {new Date(item.createdAt).toLocaleString()}</small><h3>{player?.name??"Player"}</h3><p>{item.message}</p><div><button className="primary" onClick={()=>act(item,"approved")}>{item.type==="profile-photo"?"Approve photo":"Mark used"}</button><button className="secondary" onClick={()=>act(item,"archived")}>Archive</button><button className="danger" onClick={()=>act(item,"rejected")}>Reject</button><button className="danger" onClick={()=>remove(item.id)}>Delete</button></div></div></article>}):<div className="empty">Nothing is waiting for review.</div>}</section>;
}

function PowerRankingManager({rankings,players,onChange}:{rankings:PowerRankingSnapshot[];players:Player[];onChange:(next:PowerRankingSnapshot[])=>void}){
  const latest=rankings[0]??initialRankings[0];const [week,setWeek]=useState(latest.week+1);const [date,setDate]=useState(new Date().toLocaleDateString("en-CA"));const [entries,setEntries]=useState<RankingEntry[]>(()=>players.map((player,index)=>({playerId:player.id,playerName:player.name,rank:index+1,movement:0,dnp:false,reason:""})));
  const move=(index:number,delta:number)=>{const target=index+delta;if(target<0||target>=entries.length)return;const next=[...entries];[next[index],next[target]]=[next[target],next[index]];setEntries(next.map((entry,i)=>({...entry,rank:i+1})))};
  const patch=(index:number,values:Partial<RankingEntry>)=>setEntries(current=>current.map((entry,i)=>i===index?{...entry,...values}:entry));
  const publish=()=>{const previous=new Map(latest.entries.filter(item=>item.playerId&&item.rank).map(item=>[item.playerId!,item.rank!]));const published:PowerRankingSnapshot={id:makeId("power"),week,date,publishedAt:new Date().toISOString(),entries:entries.map((entry,index)=>{const dnp=entry.dnp;const rank=dnp?null:index+1;const old=entry.playerId?previous.get(entry.playerId):undefined;return {...entry,rank,movement:dnp?0:old?old-(rank??old):0,reason:dnp?"DNP":entry.reason||"Commissioner ranking published."}})};onChange([published,...rankings]);setWeek(value=>value+1)};
  return <section className="adminCard"><Section eyebrow="WEEKLY PUBLISHER" title="Power Rankings"/><div className="formGrid"><label>Week<input type="number" value={week} onChange={event=>setWeek(Number(event.target.value))}/></label><label>Ranking date<input type="date" value={date} onChange={event=>setDate(event.target.value)}/></label></div><div className="rankingEditor">{entries.map((entry,index)=><article key={entry.playerId}><strong>{entry.dnp?"DNP":index+1}</strong><span><b>{entry.playerName}</b><textarea value={entry.reason} onChange={event=>patch(index,{reason:event.target.value})} placeholder="Why this ranking?"/></span><label><input type="checkbox" checked={entry.dnp} onChange={event=>patch(index,{dnp:event.target.checked})}/> DNP</label><div><button disabled={index===0} onClick={()=>move(index,-1)}>↑</button><button disabled={index===entries.length-1} onClick={()=>move(index,1)}>↓</button></div></article>)}</div><button className="primary" onClick={publish}>Publish Week {week} rankings</button></section>;
}

function CompareIdentity({player,awards}:{player:Player;awards:Award[]}){
  const [flipped,setFlipped]=useState(false);const resume=hallResume(player,awards);const honors=awards.filter(award=>award.winner.toLowerCase()===player.name.toLowerCase());
  return <button className={`tradingCard ${flipped?"flipped":""}`} onClick={()=>setFlipped(value=>!value)} aria-label={`Flip ${player.name} player card`}><span className="cardCorner">YG · {player.jerseyNumber?`#${player.jerseyNumber}`:player.position}</span>{!flipped?<><div className="cardPortrait">{player.photoUrl?<img src={player.photoUrl} alt=""/>:<span>{initials(player.name)}</span>}<strong>{overallRating(player)}<small>OVR</small></strong></div><div className="cardName"><small>{player.position} · {archetype(player)}</small><h2>{player.name}</h2><p>“{player.nickname}”</p></div><div className="miniBadgeRow">{playerBadges(player).slice(0,3).map(badge=><i title={badge.name} key={badge.name}>{badge.icon}</i>)}</div></>:<div className="cardBack"><small>OFFICIAL CAREER CARD</small><h2>{player.name}</h2><div className="cardTotals"><span><b>{player.pts}</b>PTS</span><span><b>{player.reb}</b>REB</span><span><b>{player.ast}</b>AST</span><span><b>{player.wins}</b>WINS</span></div><h3>Accomplishments</h3>{honors.length?honors.map(honor=><p className="majorHonor" key={`${honor.season}-${honor.name}`}>★ {honor.season} {honor.name}</p>):<p>No official awards yet.</p>}<p>{resume.milestones.length} milestone banners</p><strong>{hallProgress(resume.total)}% Hall Progress</strong></div>}<span className="flipHint">Tap to {flipped?"see front":"flip"}</span></button>;
}

function PlayerAnalytics({players,games}:{players:Player[];games:Game[]}){
  const rows=players.map(player=>{
    const logs=games.filter(game=>game.boxScore?.some(line=>line.playerId===player.id)).map(game=>({game,line:game.boxScore!.find(line=>line.playerId===player.id)!}));
    const high=(key:keyof Pick<StatLine,"pts"|"reb"|"ast">)=>logs.length?Math.max(...logs.map(log=>log.line[key])):0;
    let streak=0;for(const log of [...logs].reverse()){const winner=log.game.scoreA>log.game.scoreB?log.game.teamA:log.game.teamB;if(log.line.team===winner)streak++;else break;}
    return {player,logs:logs.length,points:high("pts"),rebounds:high("reb"),assists:high("ast"),streak};
  }).sort((a,b)=>b.points-a.points||overallRating(b.player)-overallRating(a.player));
  return <><Section eyebrow="PLAYER INTELLIGENCE" title="Career highs & current form"/><section className="analyticsTable"><div className="analyticsHead"><b>Player</b><span>GP</span><span>PTS High</span><span>REB High</span><span>AST High</span><span>Win Streak</span></div>{rows.map(row=><div className="analyticsRow" key={row.player.id}><b>{row.player.name}<small>{avg(row.player.pts,row.player)} PPG · {pct(row.player)}% wins</small></b><span>{row.logs}</span><strong>{row.points||"—"}</strong><strong>{row.rebounds||"—"}</strong><strong>{row.assists||"—"}</strong><span>{row.streak?`${row.streak} W`:"—"}</span></div>)}</section><p className="analyticsNote">Career highs and streaks use recorded player box scores. Add box scores to older games to complete the historical picture.</p></>;
}

function LeagueTimeline({games,awards,news,runs,history}:{games:Game[];awards:Award[];news:NewsStory[];runs:SundayRun[];history:HistoryEntry[]}){
  const [filter,setFilter]=useState("All");
  const items:{id:string;kind:string;icon:string;date:string;title:string;copy:string;imageUrl?:string}[]=[
    ...games.map(game=>({id:`game-${game.id}`,kind:"Games",icon:"🏀",date:game.date,title:game.title,copy:isFinal(game)?`${game.teamA} ${game.scoreA}–${game.scoreB} ${game.teamB}${game.mvp?` · MVP ${game.mvp}`:""}`:`${game.teamA} vs ${game.teamB} · Scheduled`})),
    ...awards.map((award,index)=>({id:`award-${index}`,kind:"Awards",icon:award.icon,date:`${award.season}-12-31`,title:award.name,copy:`${award.winner} · ${award.season}`})),
    ...news.filter(story=>story.published).map(story=>({id:`news-${story.id}`,kind:"News",icon:"📰",date:story.date,title:story.headline,copy:story.summary})),
    ...runs.map(run=>({id:`run-${run.id}`,kind:"Sundays",icon:"✅",date:run.date,title:`${run.title} · ${runCounts(run).going} going`,copy:`${run.startTime} at ${run.location} · ${run.status}`})),
    ...history.map(entry=>({id:`history-${entry.id}`,kind:"History",icon:entry.icon||"📜",date:entry.date,title:entry.title,copy:entry.description,imageUrl:entry.imageUrl})),
  ].sort((a,b)=>{const left=new Date(a.date).getTime()||0,right=new Date(b.date).getTime()||0;return right-left;});
  const visible=filter==="All"?items:items.filter(item=>item.kind===filter);
  return <Page eyebrow="LEAGUE HISTORY · v4.6" title="The Y's Guys timeline." subtitle="Games, awards, stories, Sundays and Commissioner-recorded memories preserved together."><div className="chips">{["All","History","Games","Awards","News","Sundays"].map(value=><button className={filter===value?"active":""} onClick={()=>setFilter(value)} key={value}>{value}</button>)}</div><section className="timeline">{visible.map(item=><article className={`timelineItem ${item.imageUrl?"withPhoto":""}`} key={item.id}>{item.imageUrl&&<img src={item.imageUrl} alt=""/>}<span className="timelineIcon">{item.icon}</span><div><small>{item.kind} · {item.date}</small><h2>{item.title}</h2><p>{item.copy}</p></div></article>)}</section></Page>;
}

function VotingCenter({polls,players,defaultPlayerId,onVote}:{polls:LeaguePoll[];players:Player[];defaultPlayerId:string;onVote:(pollId:string,voterId:string,nomineeId:string)=>Promise<void>}){
  const [voterId,setVoterId]=useState(defaultPlayerId);
  const [choices,setChoices]=useState<Record<string,string>>({});
  const [saving,setSaving]=useState("");
  const [error,setError]=useState("");
  const vote=async(poll:LeaguePoll)=>{const nomineeId=choices[poll.id];if(!voterId||!nomineeId)return;setSaving(poll.id);setError("");try{await onVote(poll.id,voterId,nomineeId)}catch(reason){setError(reason instanceof Error?reason.message:"Vote could not be saved")}finally{setSaving("")}};
  return <Page eyebrow="THE BALLOT · v4.9" title="Sunday Run MVP" subtitle="Every current player is automatically available on the ballot. Choose your name and vote—no PIN required."><label className="voterSelect">Your name<select value={voterId} onChange={event=>{const id=event.target.value;setVoterId(id);const existing:Record<string,string>={};polls.forEach(poll=>{const vote=poll.votes.find(item=>item.playerId===id);if(vote)existing[poll.id]=vote.nomineeId});setChoices(existing)}}><option value="">Choose your name</option>{players.map(player=><option value={player.id} key={player.id}>{player.name}</option>)}</select></label>{error&&<div className="formError">{error}</div>}<div className="pollGrid">{polls.map(poll=>{const total=poll.votes.length,closed=poll.status==="closed"||Boolean(poll.deadline&&new Date(poll.deadline).getTime()<Date.now()),nominees=poll.category==="Weekly Award"?players:poll.nomineeIds.map(id=>players.find(player=>player.id===id)).filter((player):player is Player=>Boolean(player));return <article className="pollCard" key={poll.id}><header><span>{poll.category}</span><b>{closed?"CLOSED":"OPEN"}</b></header><h2>{poll.title}</h2><p>{poll.description}</p><div className="nomineeList">{nominees.map(player=>{const id=player.id,votes=poll.votes.filter(item=>item.nomineeId===id).length,percent=total?Math.round(votes/total*100):0;return <button disabled={closed||!voterId} className={choices[poll.id]===id?"selected":""} onClick={()=>setChoices({...choices,[poll.id]:id})} key={id}>{player.photoUrl?<img className="avatar photoAvatar" src={player.photoUrl} alt=""/>:<span className="avatar">{initials(player.name)}</span>}<div><b>{player.name}</b>{closed&&<i><em style={{width:`${percent}%`}}/></i>}</div>{closed?<strong>{votes} · {percent}%</strong>:<small>{choices[poll.id]===id?"Selected":"Choose"}</small>}</button>})}</div>{!closed&&<button className="primary voteButton" disabled={!voterId||!choices[poll.id]||saving===poll.id} onClick={()=>vote(poll)}>{saving===poll.id?"Saving…":poll.votes.some(item=>item.playerId===voterId)?"Update vote":"Submit vote"}</button>}<footer>{total} recorded {total===1?"vote":"votes"}{poll.deadline?` · Deadline ${new Date(poll.deadline).toLocaleString()}`:""}</footer></article>})}</div></Page>;
}

function ShareStudio({players,games,runs,news}:{players:Player[];games:Game[];runs:SundayRun[];news:NewsStory[]}){
  const [template,setTemplate]=useState<"leaders"|"result"|"sunday"|"news">("leaders");
  const canvasRef=React.useRef<HTMLCanvasElement>(null);
  const leaders=[...players].sort((a,b)=>b.pts-a.pts).slice(0,5),finals=[...games].filter(isFinal),latest=finals[finals.length-1],next=[...runs].sort((a,b)=>a.date.localeCompare(b.date)).find(run=>run.date>=new Date().toLocaleDateString("en-CA")),story=news.find(item=>item.featured&&item.published)??news.find(item=>item.published);
  useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const ctx=canvas.getContext("2d");if(!ctx)return;const W=1080,H=1350;ctx.clearRect(0,0,W,H);const gradient=ctx.createLinearGradient(0,0,W,H);gradient.addColorStop(0,"#071c3e");gradient.addColorStop(.65,"#0A2D5E");gradient.addColorStop(1,"#173f69");ctx.fillStyle=gradient;ctx.fillRect(0,0,W,H);ctx.fillStyle="rgba(199,162,77,.12)";ctx.beginPath();ctx.arc(950,130,330,0,Math.PI*2);ctx.fill();ctx.fillStyle="#C7A24D";ctx.font="900 42px Arial";ctx.fillText("Y'S GUYS",70,85);ctx.fillStyle="#fff";ctx.font="900 78px Arial";const text=(value:string,x:number,y:number,max=900)=>{const words=value.split(" ");let line="",offset=0;for(const word of words){const test=`${line}${word} `;if(ctx.measureText(test).width>max&&line){ctx.fillText(line,x,y+offset);line=`${word} `;offset+=88}else line=test}ctx.fillText(line,x,y+offset);return y+offset};if(template==="leaders"){ctx.fillText("LEAGUE LEADERS",70,205);leaders.forEach((player,index)=>{const y=340+index*165;ctx.fillStyle=index===0?"#C7A24D":"#fff";ctx.font="900 58px Arial";ctx.fillText(`${index+1}`,75,y);ctx.fillStyle="#fff";ctx.fillText(player.name,150,y);ctx.fillStyle="#C7A24D";ctx.textAlign="right";ctx.fillText(`${player.pts} PTS`,1000,y);ctx.textAlign="left";ctx.fillStyle="#aebdd0";ctx.font="700 30px Arial";ctx.fillText(`${avg(player.pts,player)} PPG · ${player.wins}-${player.losses}`,150,y+45)});}else if(template==="result"&&latest){ctx.fillText("FINAL SCORE",70,205);ctx.fillStyle="#C7A24D";ctx.font="900 128px Arial";ctx.fillText(`${latest.scoreA} – ${latest.scoreB}`,70,420);ctx.fillStyle="#fff";ctx.font="900 64px Arial";ctx.fillText(latest.teamA,70,540);ctx.fillText(latest.teamB,70,630);ctx.fillStyle="#aebdd0";ctx.font="700 34px Arial";ctx.fillText(latest.date,70,735);ctx.fillText(`PLAYER OF THE GAME · ${latest.mvp||"—"}`,70,800)}else if(template==="sunday"&&next){const counts=runCounts(next);ctx.fillText("SUNDAY RUN",70,205);ctx.fillStyle="#C7A24D";ctx.font="900 80px Arial";ctx.fillText(formatRunDate(next.date),70,345);ctx.fillStyle="#fff";ctx.font="900 58px Arial";ctx.fillText(`${next.startTime} · ${next.location}`,70,445);ctx.font="900 170px Arial";ctx.fillText(String(counts.going),70,710);ctx.fillStyle="#C7A24D";ctx.font="900 40px Arial";ctx.fillText("PLAYERS GOING",75,775);ctx.fillStyle="#fff";ctx.font="700 34px Arial";const names=next.rsvps.filter(item=>item.status==="going").map(item=>players.find(player=>player.id===item.playerId)?.name).filter(Boolean).join(" · ");text(names||"RSVP NOW",70,885)}else if(template==="news"&&story){ctx.fillText(story.category.toUpperCase(),70,205);ctx.fillStyle="#fff";ctx.font="900 76px Arial";const end=text(story.headline,70,345);ctx.fillStyle="#C7A24D";ctx.font="700 36px Arial";text(story.summary,70,end+130)}ctx.fillStyle="#C7A24D";ctx.fillRect(70,1250,940,6);ctx.fillStyle="#fff";ctx.font="700 27px Arial";ctx.fillText("THE OFFICIAL Y'S GUYS LEAGUE UNIVERSE",70,1310)},[template,players,games,runs,news]);
  const download=()=>{const canvas=canvasRef.current;if(!canvas)return;const link=document.createElement("a");link.download=`ys-guys-${template}-${new Date().toISOString().slice(0,10)}.png`;link.href=canvas.toDataURL("image/png");link.click()};
  return <Page eyebrow="CONTENT LAB · v4.5" title="Share Studio" subtitle="Turn live league data into a polished graphic ready for Instagram, group chat or the archive."><div className="studioLayout"><section><div className="chips">{([["leaders","Leaders"],["result","Latest Result"],["sunday","Sunday Turnout"],["news","Featured News"]] as const).map(([value,label])=><button className={template===value?"active":""} onClick={()=>setTemplate(value)} key={value}>{label}</button>)}</div><div className="studioHelp"><h2>Automatic league artwork</h2><p>The graphic is generated from current data. Update the league first, then return here and download a fresh version.</p><button className="primary" onClick={download}>Download PNG</button></div></section><canvas ref={canvasRef} width="1080" height="1350"/></div></Page>;
}

function AttendanceCenter({runs,players,defaultPlayerId,onSubmit}:{runs:SundayRun[];players:Player[];defaultPlayerId:string;onSubmit:(runId:string,rsvp:Omit<RunRsvp,"updatedAt">)=>Promise<void>}){
  const upcoming=[...runs].filter(run=>run.date>=new Date().toLocaleDateString("en-CA")).sort((a,b)=>a.date.localeCompare(b.date));
  const [selectedId,setSelectedId]=useState(upcoming[0]?.id??runs[runs.length-1]?.id??"");
  const [playerId,setPlayerId]=useState(defaultPlayerId);
  const [status,setStatus]=useState<RsvpStatus>("going");
  const [arrivalTime,setArrivalTime]=useState("");
  const [note,setNote]=useState("");
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const run=runs.find(item=>item.id===selectedId)??upcoming[0]??runs[0];
  useEffect(()=>{if(!run||!playerId)return;const existing=run.rsvps.find(item=>item.playerId===playerId);if(existing){setStatus(existing.status);setArrivalTime(existing.arrivalTime??"");setNote(existing.note??"")}},[run?.id,playerId]);
  const submit=async(event:React.FormEvent)=>{
    event.preventDefault();if(!run||!playerId)return;
    setSaving(true);setError("");
    try{await onSubmit(run.id,{playerId,status,arrivalTime:arrivalTime.trim(),note:note.trim()});setNote("");}
    catch(reason){setError(reason instanceof Error?reason.message:"Response could not be saved");}
    finally{setSaving(false);}
  };
  if(!run)return <Page eyebrow="SUNDAY RUN" title="Attendance center" subtitle="Check back when the next Sunday is posted."><div className="communityEmpty"><span>🏀</span><h2>No Sunday runs posted yet.</h2></div></Page>;
  const counts=runCounts(run),deadlinePassed=Boolean(run.deadline&&new Date(run.deadline).getTime()<Date.now()),locked=run.status!=="open"||deadlinePassed;
  const group=(groupStatus:RsvpStatus,label:string)=>{const responses=run.rsvps.filter(item=>item.status===groupStatus);return <section className={`rsvpGroup ${groupStatus}`}><header><b>{label}</b><span>{responses.length}</span></header>{responses.length?responses.map(item=>{const player=players.find(person=>person.id===item.playerId);return <div className="rsvpPerson" key={item.playerId}><span className="avatar">{player?initials(player.name):"?"}</span><div><b>{player?.name??"Former player"}</b><small>{item.arrivalTime||"No arrival time"}{item.note?` · ${item.note}`:""} · Updated {new Date(item.updatedAt).toLocaleString()}</small></div></div>}):<p>No responses yet.</p>}</section>};
  return <Page eyebrow="SUNDAY RUN · v4.0" title="Are you in?" subtitle="Choose your name and let the group know your Sunday availability. No account or PIN required.">
    {runs.length>1&&<div className="runSelector">{[...runs].sort((a,b)=>b.date.localeCompare(a.date)).map(item=><button className={item.id===run.id?"active":""} onClick={()=>setSelectedId(item.id)} key={item.id}>{localDate(item.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}<small>{item.status}</small></button>)}</div>}
    <section className={`attendanceHero ${run.status}`}><div><span>{run.status==="open"?"RSVP OPEN":run.status.toUpperCase()}</span><h2>{formatRunDate(run.date)}</h2><p>{run.startTime} · {run.location}</p>{run.notes&&<small>{run.notes}</small>}</div><div className="attendanceTotals"><span><b>{counts.going}</b>Going</span><span><b>{counts.maybe}</b>Maybe</span><span><b>{counts.out}</b>Out</span></div></section>
    {!locked&&<form className="rsvpForm" onSubmit={submit}><h2>Update your response</h2><div className="rsvpFields"><label>Your name<select required value={playerId} onChange={event=>{const id=event.target.value;setPlayerId(id);const existing=run.rsvps.find(item=>item.playerId===id);if(existing){setStatus(existing.status);setArrivalTime(existing.arrivalTime??"");setNote(existing.note??"")}}}><option value="">Choose your name</option>{players.map(player=><option value={player.id} key={player.id}>{player.name}</option>)}</select></label><label>Arrival time<input value={arrivalTime} onChange={event=>setArrivalTime(event.target.value)} placeholder={run.startTime}/></label></div><div className="statusChoices">{([["going","✅","Going"],["maybe","❓","Maybe"],["out","❌","Not going"]] as const).map(([value,icon,label])=><button type="button" className={status===value?"active":""} onClick={()=>setStatus(value)} key={value}><span>{icon}</span>{label}</button>)}</div><label>Optional note<input maxLength={140} value={note} onChange={event=>setNote(event.target.value)} placeholder="Running late, bringing someone, etc."/></label>{error&&<div className="formError">{error}</div>}<button className="primary" disabled={saving||!playerId}>{saving?"Saving…":"Save my response"}</button><small className="honorNote">Responses use the honor system. Select only your own name.</small></form>}
    {locked&&<div className="lockedNotice">{run.status==="cancelled"?"This Sunday run was cancelled.":deadlinePassed?"The RSVP deadline has passed.":"Attendance is locked for this Sunday."}</div>}
    <div className="rsvpGrid">{group("going","Going")}{group("maybe","Maybe")}{group("out","Not going")}</div>
  </Page>;
}

function CalendarView({games,runs}:{games:Game[];runs:SundayRun[]}){
  const first=runs[0]?localDate(runs[0].date):games.map(game=>new Date(game.date)).find(date=>!Number.isNaN(date.getTime()))??new Date();
  const [month,setMonth]=useState(new Date(first.getFullYear(),first.getMonth(),1));
  const year=month.getFullYear(),monthIndex=month.getMonth(),days=new Date(year,monthIndex+1,0).getDate(),offset=new Date(year,monthIndex,1).getDay();
  const cells=Array.from({length:offset+days},(_,index)=>index<offset?null:index-offset+1);
  const gamesForDay=(day:number)=>games.filter(game=>{const date=new Date(game.date);return !Number.isNaN(date.getTime())&&date.getFullYear()===year&&date.getMonth()===monthIndex&&date.getDate()===day});
  const runsForDay=(day:number)=>runs.filter(run=>{const date=localDate(run.date);return date.getFullYear()===year&&date.getMonth()===monthIndex&&date.getDate()===day});
  return <Page eyebrow="LEAGUE CALENDAR · v4.0" title="Every Sunday, in one place." subtitle="Attendance, scheduled games and final results share one calendar."><div className="calendarControls"><button aria-label="Previous month" onClick={()=>setMonth(new Date(year,monthIndex-1,1))}>←</button><h2>{month.toLocaleString(undefined,{month:"long",year:"numeric"})}</h2><button aria-label="Next month" onClick={()=>setMonth(new Date(year,monthIndex+1,1))}>→</button></div><section className="calendar"><div className="weekday">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(day=><b key={day}>{day}</b>)}</div><div className="calendarGrid">{cells.map((day,index)=><div className={day?(index%7===0?"calendarDay sunday":"calendarDay"):"calendarDay blank"} key={`${year}-${monthIndex}-${index}`}>{day&&<><span>{day}</span>{runsForDay(day).map(run=><article className={`calendarRun ${run.status}`} key={run.id}><b>{run.status==="cancelled"?"Cancelled":`${runCounts(run).going} going`}</b><small>{run.startTime} · {run.location}</small></article>)}{gamesForDay(day).map(game=><article className={isFinal(game)?"calendarGame final":"calendarGame"} key={game.id}><b>{game.teamA} {isFinal(game)?game.scoreA:""} {isFinal(game)?"–":"vs"} {game.teamB} {isFinal(game)?game.scoreB:""}</b><small>{game.startTime||game.title}</small></article>)}</>}</div>)}</div></section></Page>;
}

function RuleBook(){
  const sections=[
    {icon:"🏀",title:"Game Format",rules:["Sides are organized fresh for competitive, balanced Sunday runs.","Official scores and results are published through Commissioner Mode.","A scheduled game does not affect career records until marked Final."]},
    {icon:"🔥",title:"Heat Check",rules:["The league may use the Heat Check bonus when announced before play.","A successful Heat Check is worth one additional point.","The rule must be applied consistently to both teams."]},
    {icon:"🗳️",title:"Voting & Awards",rules:["Players vote for weekly or seasonal MVP recognition.","Award votes should reflect performance, winning and sportsmanship.","The commissioner records official winners in the Awards Center."]},
    {icon:"🤝",title:"League Conduct",rules:["Compete hard while respecting teammates, opponents and the facility.","Settle disputed calls quickly and keep the game moving.","Dangerous or repeated unsportsmanlike play can lead to removal from a run."]},
    {icon:"📊",title:"Statistics",rules:["Only final games count toward player career totals.","Each player may have one official box-score line per game.","Editing or deleting a box score automatically reverses its old totals."]},
    {icon:"⚖️",title:"Commissioner Authority",rules:["The commissioner maintains schedules, results, rosters and corrections.","Major rule changes should be announced before they take effect.","Backups should be downloaded before major historical edits."]},
  ];
  return <Page eyebrow="OFFICIAL RULE BOOK · v2.9" title="How the Y's Guys universe operates." subtitle="A living foundation for fair competition, accurate history and a better weekly run."><div className="ruleHero"><span>YG</span><div><b>LEAGUE STANDARD</b><h2>Compete. Record. Respect the run.</h2></div></div><div className="rulesGrid">{sections.map((section,index)=><section className="ruleSection" key={section.title}><div><span>{section.icon}</span><small>ARTICLE {index+1}</small></div><h2>{section.title}</h2><ol>{section.rules.map(rule=><li key={rule}>{rule}</li>)}</ol></section>)}</div><div className="note">This digital rule book is the current league reference. Commissioner-controlled rule editing can be added in a future release.</div></Page>;
}

function CommissionerDashboard({players,games,runs,news,polls,history,onOpen}:{players:Player[];games:Game[];runs:SundayRun[];news:NewsStory[];polls:LeaguePoll[];history:HistoryEntry[];onOpen:(tab:AdminTab)=>void}){
  const nextRun=[...runs].sort((a,b)=>a.date.localeCompare(b.date)).find(run=>run.date>=new Date().toLocaleDateString("en-CA")&&run.status!=="cancelled");
  const missingProfiles=players.filter(player=>!player.photoUrl||!player.bio||!player.height).length;
  const actions:{tab:AdminTab;icon:string;title:string;copy:string}[]=[
    {tab:"runs",icon:"✅",title:"Post Sunday",copy:nextRun?`${formatRunDate(nextRun.date)} · ${runCounts(nextRun).going} going`:"No upcoming Sunday posted"},
    {tab:"games",icon:"🏀",title:"Enter a game",copy:`${games.length} games in the archive`},
    {tab:"players",icon:"👤",title:"Add a player",copy:`${players.length} players · ${missingProfiles} profiles need details`},
    {tab:"history",icon:"📜",title:"Add history",copy:`${history.length} manual moments preserved`},
    {tab:"news",icon:"📰",title:"Publish news",copy:`${news.filter(item=>item.published).length} published stories`},
    {tab:"polls",icon:"🗳️",title:"Open voting",copy:`${polls.filter(poll=>poll.status==="open").length} active polls`},
    {tab:"awards",icon:"🏆",title:"Record an award",copy:"Update the official trophy room"},
    {tab:"data",icon:"🛡️",title:"Backups",copy:"Restore points and downloaded copies"},
  ];
  return <><section className="commandHero"><div><span>COMMISSIONER COMMAND CENTER</span><h2>What are we updating today?</h2><p>Every published action syncs to the league and creates a cloud restore point.</p></div><div><strong>{players.length}</strong><small>PLAYERS</small><strong>{games.length}</strong><small>GAMES</small><strong>{history.length}</strong><small>HISTORY</small></div></section><div className="commandGrid">{actions.map(action=><button onClick={()=>onOpen(action.tab)} key={action.tab}><span>{action.icon}</span><div><b>{action.title}</b><small>{action.copy}</small></div><i>→</i></button>)}</div></>;
}

function RunManager({runs,onChange,onConvert}:{runs:SundayRun[];onChange:(runs:SundayRun[])=>void;onConvert:(run:SundayRun)=>void}){
  const nextSunday=()=>{const date=new Date();date.setDate(date.getDate()+((7-date.getDay())%7||7));return date.toLocaleDateString("en-CA");};
  const empty:SundayRun={id:"",date:nextSunday(),title:"Sunday Run",startTime:"9:00 AM",location:"Highland YMCA",deadline:"",notes:"",status:"open",rsvps:[]};
  const [draft,setDraft]=useState<SundayRun>(empty);
  const editing=Boolean(draft.id);
  const save=(event:React.FormEvent)=>{
    event.preventDefault();
    if(localDate(draft.date).getDay()!==0&&!confirm("That date is not a Sunday. Save it anyway?"))return;
    const clean={...draft,id:draft.id||makeId("run"),title:draft.title.trim()||"Sunday Run",location:draft.location.trim()};
    onChange((editing?runs.map(run=>run.id===clean.id?clean:run):[...runs,clean]).sort((a,b)=>a.date.localeCompare(b.date)));setDraft(empty);
  };
  const remove=(id:string)=>{if(confirm("Delete this Sunday and all of its attendance responses?")){onChange(runs.filter(run=>run.id!==id));setDraft(empty);}};
  const generateSundays=()=>{
    const latest=runs.length?localDate([...runs].sort((a,b)=>b.date.localeCompare(a.date))[0].date):new Date();
    const cursor=new Date(Math.max(latest.getTime(),Date.now()));cursor.setDate(cursor.getDate()+((7-cursor.getDay())%7||7));
    const additions:SundayRun[]=[];
    for(let index=0;index<8;index++){const date=cursor.toLocaleDateString("en-CA");if(!runs.some(run=>run.date===date))additions.push({...empty,id:makeId("run"),date,rsvps:[]});cursor.setDate(cursor.getDate()+7);}
    if(!additions.length)return alert("The next eight Sundays are already posted.");
    onChange([...runs,...additions].sort((a,b)=>a.date.localeCompare(b.date)));
  };
  return <div className="managerGrid"><form className="adminCard" onSubmit={save}><h2>{editing?"Edit Sunday run":"Post a Sunday run"}</h2><p>Create the attendance page, set the location, or lock responses when the deadline passes.</p><div className="formGrid">
    <label>Date<input required type="date" value={draft.date} onChange={event=>setDraft({...draft,date:event.target.value})}/></label>
    <label>Status<select value={draft.status} onChange={event=>setDraft({...draft,status:event.target.value as SundayRun["status"]})}><option value="open">Open for RSVPs</option><option value="locked">Locked</option><option value="cancelled">Cancelled</option></select></label>
    <label>Start time<input required value={draft.startTime} onChange={event=>setDraft({...draft,startTime:event.target.value})} placeholder="9:00 AM"/></label>
    <label>Location<input required value={draft.location} onChange={event=>setDraft({...draft,location:event.target.value})}/></label>
    <label className="wide">Title<input value={draft.title} onChange={event=>setDraft({...draft,title:event.target.value})}/></label>
    <label className="wide">RSVP deadline<input type="datetime-local" value={draft.deadline??""} onChange={event=>setDraft({...draft,deadline:event.target.value})}/></label>
    <label className="wide">Sunday notes<textarea value={draft.notes??""} onChange={event=>setDraft({...draft,notes:event.target.value})} placeholder="Court information, special start time, reminders…"/></label>
  </div><div className="formActions"><button className="primary">{editing?"Save Sunday":"Post Sunday"}</button><button className="secondary" type="button" onClick={generateSundays}>Generate next 8 Sundays</button>{editing&&<button className="secondary" type="button" onClick={()=>setDraft(empty)}>Cancel</button>}</div></form>
  <ManageList title="Sunday history" empty="No Sundays posted yet.">{[...runs].sort((a,b)=>b.date.localeCompare(a.date)).map(run=>{const counts=runCounts(run);return <div className="manageRow runManageRow" key={run.id}><div><b>{formatRunDate(run.date)}</b><small>{run.status} · {counts.going} going · {counts.maybe} maybe · {counts.out} out</small></div><button onClick={()=>onConvert(run)}>Create game</button><button onClick={()=>setDraft({...run,rsvps:run.rsvps.map(item=>({...item}))})}>Edit</button><button className="deleteLink" onClick={()=>remove(run.id)}>Delete</button></div>})}</ManageList></div>;
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
    <label>Side A label<input required value={draft.teamA} onChange={e=>setDraft({...draft,teamA:e.target.value})}/></label>
    <label>Side A score<input min="0" type="number" value={draft.scoreA} onChange={e=>setDraft({...draft,scoreA:Number(e.target.value)})}/></label>
    <label>Side B label<input required value={draft.teamB} onChange={e=>setDraft({...draft,teamB:e.target.value})}/></label>
    <label>Side B score<input min="0" type="number" value={draft.scoreB} onChange={e=>setDraft({...draft,scoreB:Number(e.target.value)})}/></label>
    <label className="wide">Player of the game<select value={draft.mvp} onChange={e=>setDraft({...draft,mvp:e.target.value})}><option value="">Select a player</option>{players.map(p=><option key={p.id}>{p.name}</option>)}</select></label>
    <label className="wide">Recap<textarea value={draft.recap} onChange={e=>setDraft({...draft,recap:e.target.value})} placeholder="What decided the game?"/></label>
  </div>{isFinal(draft)&&<div className="boxScoreEditor"><div className="boxScoreTitle"><div><b>Player box score</b><small>These entries automatically adjust career totals and records.</small></div><button type="button" onClick={addLine}>+ Add player line</button></div>{(draft.boxScore??[]).map((line,index)=><div className="statLineEdit" key={`${line.playerId}-${index}`}><select value={line.playerId} onChange={e=>updateLine(index,{playerId:e.target.value})}>{players.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select><select value={line.team} onChange={e=>updateLine(index,{team:e.target.value})}><option>{draft.teamA||"Side A"}</option><option>{draft.teamB||"Side B"}</option></select>{(["pts","reb","ast","turnovers"] as const).map(key=><label key={key}>{key==="turnovers"?"TO":key.toUpperCase()}<input type="number" min="0" value={line[key]} onChange={e=>updateLine(index,{[key]:Number(e.target.value)})}/></label>)}<button className="deleteLink" type="button" onClick={()=>setDraft({...draft,boxScore:(draft.boxScore??[]).filter((_,i)=>i!==index)})}>×</button></div>)}</div>}<div className="formActions"><button className="primary" type="submit">{editing?"Save changes":"Add game"}</button>{editing&&<button className="secondary" type="button" onClick={()=>{setDraft(empty);setOriginal(undefined)}}>Cancel</button>}</div></form>
  <ManageList title="Recorded games" empty="No games recorded yet.">{games.map(g=><div className="manageRow" key={g.id}><div><b>{g.title}</b><small>{g.date} · {g.teamA} {g.scoreA}–{g.scoreB} {g.teamB} · {g.boxScore?.length??0} stat lines</small></div><button onClick={()=>{setDraft({...g,boxScore:(g.boxScore??[]).map(line=>({...line}))});setOriginal(g)}}>Edit</button><button className="deleteLink" onClick={()=>remove(g)}>Delete</button></div>)}</ManageList></div>;
}

function PlayerManager({players,onChange}:{players:Player[];onChange:(players:Player[])=>void}){
  const empty:Player={id:"",name:"",nickname:"",position:"G",wins:0,losses:0,pts:0,reb:0,ast:0,turnovers:0,awards:[],bio:"",jerseyNumber:"",height:"",strengths:"",signatureBadge:"",photoUrl:"",bannerColor:"#0A2D5E",overallOverride:undefined};
  const [draft,setDraft]=useState<Player>(empty);
  const [imageStatus,setImageStatus]=useState("");
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
  return <div className="managerGrid"><form className="adminCard" onSubmit={save}><h2>{editing?"Edit player":"Add a player"}</h2><p>Control the displayed overall, career totals, identity, profile photo and personal awards.</p><div className="formGrid">
    <label>Name<input required value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
    <label>Nickname<input value={draft.nickname} onChange={e=>setDraft({...draft,nickname:e.target.value})}/></label>
    <label>Position<select value={draft.position} onChange={e=>setDraft({...draft,position:e.target.value})}>{["G","F","C","PG","SG","SF","PF"].map(x=><option key={x}>{x}</option>)}</select></label>
    <label>Jersey number<input value={draft.jerseyNumber??""} onChange={e=>setDraft({...draft,jerseyNumber:e.target.value})} placeholder="23"/></label>
    <label>Height<input value={draft.height??""} onChange={e=>setDraft({...draft,height:e.target.value})} placeholder="6'1&quot;"/></label>
    <label>Overall rating<input min="40" max="99" type="number" value={draft.overallOverride??""} onChange={e=>setDraft({...draft,overallOverride:e.target.value===""?undefined:Number(e.target.value)})} placeholder={String(calculatedOverall(draft))}/><small>{draft.overallOverride===undefined?`Automatic: ${calculatedOverall(draft)} OVR`:`Commissioner override · automatic would be ${calculatedOverall(draft)}`}</small></label>
    <label>Signature badge<input value={draft.signatureBadge??""} onChange={e=>setDraft({...draft,signatureBadge:e.target.value})} placeholder="Acrobat Finisher"/></label>
    <label>Banner color<input type="color" value={draft.bannerColor??"#0A2D5E"} onChange={e=>setDraft({...draft,bannerColor:e.target.value})}/></label>
    {numberField("wins")}{numberField("losses")}{numberField("pts")}{numberField("reb")}{numberField("ast")}{numberField("turnovers")}
    <label className="wide">Player-profile awards, separated by commas<input value={draft.awards.join(", ")} onChange={e=>setDraft({...draft,awards:e.target.value.split(",").map(x=>x.trim())})} placeholder="2025 MVP, Week 3 Player of the Game"/></label>
    <div className="wide imagePicker"><b>Profile picture</b>{draft.photoUrl&&<img src={draft.photoUrl} alt="Player preview"/>}<div><label className="uploadButton">Choose picture<input type="file" accept="image/*" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setImageStatus("Preparing picture…");try{setDraft({...draft,photoUrl:await compressImage(file)});setImageStatus("Picture ready — save the player to publish it.")}catch(error){setImageStatus(error instanceof Error?error.message:"Could not prepare picture")}e.target.value="";}}/></label>{draft.photoUrl&&<button className="danger compact" type="button" onClick={()=>setDraft({...draft,photoUrl:""})}>Remove picture</button>}</div>{imageStatus&&<small>{imageStatus}</small>}<em>Phone photos are automatically resized for faster loading.</em></div>
    <label className="wide">Or use a hosted photo URL<input type="url" value={draft.photoUrl?.startsWith("data:")?"":draft.photoUrl??""} onChange={e=>setDraft({...draft,photoUrl:e.target.value})} placeholder="https://…"/></label>
    <label className="wide">Strengths<textarea value={draft.strengths??""} onChange={e=>setDraft({...draft,strengths:e.target.value})} placeholder="On-ball defense, transition finishing, rebounding…"/></label>
    <label className="wide">Bio<textarea value={draft.bio} onChange={e=>setDraft({...draft,bio:e.target.value})}/></label>
  </div><div className="formActions"><button className="primary" type="submit">{editing?"Save changes":"Add player"}</button>{editing&&<button className="secondary" type="button" onClick={()=>setDraft(empty)}>Cancel</button>}</div></form>
  <ManageList title="Current roster" empty="No players yet.">{players.map(p=><div className="manageRow" key={p.id}><div><b>{p.name}</b><small>{p.position} · {p.wins}-{p.losses} · {p.pts} PTS</small></div><button onClick={()=>setDraft({...p,awards:[...p.awards]})}>Edit</button><button className="deleteLink" onClick={()=>remove(p.id)}>Delete</button></div>)}</ManageList></div>;
}

function HistoryManager({history,onChange}:{history:HistoryEntry[];onChange:(history:HistoryEntry[])=>void}){
  const empty:HistoryEntry={id:"",date:new Date().toLocaleDateString("en-CA"),title:"",description:"",category:"Milestone",icon:"📜",imageUrl:""};
  const [draft,setDraft]=useState<HistoryEntry>(empty);
  const [imageStatus,setImageStatus]=useState("");
  const editing=Boolean(draft.id);
  const save=(event:React.FormEvent)=>{event.preventDefault();if(!draft.title.trim()||!draft.description.trim())return alert("Add a title and description.");const clean={...draft,id:draft.id||makeId("history"),title:draft.title.trim(),description:draft.description.trim()};onChange((editing?history.map(entry=>entry.id===clean.id?clean:entry):[...history,clean]).sort((a,b)=>b.date.localeCompare(a.date)));setDraft(empty);setImageStatus("")};
  const remove=(id:string)=>{if(confirm("Delete this historical entry?")){onChange(history.filter(entry=>entry.id!==id));setDraft(empty)}};
  return <div className="managerGrid"><form className="adminCard" onSubmit={save}><h2>{editing?"Edit history":"Add league history"}</h2><p>Record moments that happened before the app or deserve a permanent place in the archive.</p><div className="formGrid"><label>Date<input required type="date" value={draft.date} onChange={event=>setDraft({...draft,date:event.target.value})}/></label><label>Category<select value={draft.category} onChange={event=>setDraft({...draft,category:event.target.value as HistoryEntry["category"]})}>{["Milestone","Past Game","Championship","Award","Community","Rule Change","Other"].map(value=><option key={value}>{value}</option>)}</select></label><label>Icon<input value={draft.icon} onChange={event=>setDraft({...draft,icon:event.target.value})} placeholder="🏀"/></label><label>Title<input required value={draft.title} onChange={event=>setDraft({...draft,title:event.target.value})} placeholder="The first championship"/></label><label className="wide">What happened?<textarea required value={draft.description} onChange={event=>setDraft({...draft,description:event.target.value})} placeholder="Tell the story and explain why this moment matters…"/></label><div className="wide imagePicker"><b>Optional historical photo</b>{draft.imageUrl&&<img src={draft.imageUrl} alt="History preview"/>}<div><label className="uploadButton">Choose picture<input type="file" accept="image/*" onChange={async event=>{const file=event.target.files?.[0];if(!file)return;setImageStatus("Preparing picture…");try{setDraft({...draft,imageUrl:await compressImage(file)});setImageStatus("Picture ready — save the entry to publish it.")}catch(reason){setImageStatus(reason instanceof Error?reason.message:"Could not prepare picture")}event.target.value=""}}/></label>{draft.imageUrl&&<button className="danger compact" type="button" onClick={()=>setDraft({...draft,imageUrl:""})}>Remove picture</button>}</div>{imageStatus&&<small>{imageStatus}</small>}</div></div><div className="formActions"><button className="primary">{editing?"Save history":"Add to timeline"}</button>{editing&&<button className="secondary" type="button" onClick={()=>{setDraft(empty);setImageStatus("")}}>Cancel</button>}</div></form><ManageList title="Manual history" empty="No manual history entries yet.">{[...history].sort((a,b)=>b.date.localeCompare(a.date)).map(entry=><div className="manageRow" key={entry.id}><div><b>{entry.icon} {entry.title}</b><small>{formatRunDate(entry.date)} · {entry.category}</small></div><button onClick={()=>setDraft({...entry})}>Edit</button><button className="deleteLink" onClick={()=>remove(entry.id)}>Delete</button></div>)}</ManageList></div>;
}

function NewsManager({news,onChange}:{news:NewsStory[];onChange:(news:NewsStory[])=>void}){
  const empty:NewsStory={id:"",headline:"",summary:"",category:"League News",date:new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),imageUrl:"",featured:false,published:true};
  const [draft,setDraft]=useState<NewsStory>(empty);
  const [imageStatus,setImageStatus]=useState("");
  const editing=Boolean(draft.id);
  const save=(event:React.FormEvent)=>{
    event.preventDefault();
    if(!draft.headline.trim()||!draft.summary.trim())return alert("Headline and story summary are required.");
    const story={...draft,id:draft.id||makeId("story"),headline:draft.headline.trim(),summary:draft.summary.trim(),category:draft.category.trim()||"League News"};
    let next=editing?news.map(item=>item.id===story.id?story:item):[story,...news];
    if(story.featured)next=next.map(item=>({...item,featured:item.id===story.id}));
    onChange(next);setDraft(empty);setImageStatus("");
  };
  const remove=(id:string)=>{if(confirm("Delete this community story?")){onChange(news.filter(item=>item.id!==id));setDraft(empty);}};
  const move=(id:string,direction:-1|1)=>{
    const index=news.findIndex(item=>item.id===id),target=index+direction;if(index<0||target<0||target>=news.length)return;
    const next=[...news];[next[index],next[target]]=[next[target],next[index]];onChange(next);
  };
  return <div className="managerGrid"><form className="adminCard" onSubmit={save}><h2>{editing?"Edit community story":"Create community story"}</h2><p>Publish announcements, recaps and photos without changing code.</p><div className="formGrid">
    <label>Category<select value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}>{["League News","Game Recap","Announcement","Player Spotlight","Record Watch","Community"].map(value=><option key={value}>{value}</option>)}</select></label>
    <label>Date<input value={draft.date} onChange={e=>setDraft({...draft,date:e.target.value})}/></label>
    <label className="wide">Headline<input required maxLength={100} value={draft.headline} onChange={e=>setDraft({...draft,headline:e.target.value})} placeholder="What happened?"/></label>
    <label className="wide">Story summary<textarea required maxLength={700} value={draft.summary} onChange={e=>setDraft({...draft,summary:e.target.value})} placeholder="Tell the community the story…"/></label>
    <div className="wide imagePicker"><b>Story picture</b>{draft.imageUrl&&<img className="storyPreview" src={draft.imageUrl} alt="Story preview"/>}<div><label className="uploadButton">Choose picture<input type="file" accept="image/*" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setImageStatus("Preparing picture…");try{setDraft({...draft,imageUrl:await compressImage(file)});setImageStatus("Picture ready — save the story to publish it.")}catch(error){setImageStatus(error instanceof Error?error.message:"Could not prepare picture")}e.target.value="";}}/></label>{draft.imageUrl&&<button className="danger compact" type="button" onClick={()=>setDraft({...draft,imageUrl:""})}>Remove picture</button>}</div>{imageStatus&&<small>{imageStatus}</small>}<em>Images are automatically resized and saved with the story.</em></div>
    <label className="checkLabel"><input type="checkbox" checked={draft.featured} onChange={e=>setDraft({...draft,featured:e.target.checked})}/> Feature on Home</label>
    <label className="checkLabel"><input type="checkbox" checked={draft.published} onChange={e=>setDraft({...draft,published:e.target.checked})}/> Published</label>
  </div><div className="formActions"><button className="primary" type="submit">{editing?"Save story":"Publish story"}</button>{editing&&<button className="secondary" type="button" onClick={()=>{setDraft(empty);setImageStatus("")}}>Cancel</button>}</div></form>
  <ManageList title="Community newsroom" empty="No stories yet.">{news.map((story,index)=><div className="manageRow newsManageRow" key={story.id}>{story.imageUrl?<img src={story.imageUrl} alt=""/>:<span className="storyMini">YG</span>}<div><b>{story.headline}</b><small>{story.category} · {story.published?"Published":"Draft"}{story.featured?" · Featured":""}</small></div><span className="orderButtons"><button disabled={index===0} onClick={()=>move(story.id,-1)} aria-label="Move story up">↑</button><button disabled={index===news.length-1} onClick={()=>move(story.id,1)} aria-label="Move story down">↓</button></span><button onClick={()=>setDraft({...story})}>Edit</button><button className="deleteLink" onClick={()=>remove(story.id)}>Delete</button></div>)}</ManageList></div>;
}

function PollManager({polls,players,onChange}:{polls:LeaguePoll[];players:Player[];onChange:(polls:LeaguePoll[])=>void}){
  const empty:LeaguePoll={id:"",title:"",description:"",category:"Weekly Award",deadline:"",status:"open",nomineeIds:[],votes:[],createdAt:new Date().toISOString()};
  const [draft,setDraft]=useState<LeaguePoll>(empty);
  const editing=Boolean(draft.id);
  const save=(event:React.FormEvent)=>{event.preventDefault();if(!draft.title.trim()||draft.nomineeIds.length<2)return alert("Add a title and at least two nominees.");const clean={...draft,id:draft.id||makeId("poll"),title:draft.title.trim(),description:draft.description.trim()};onChange(editing?polls.map(poll=>poll.id===clean.id?clean:poll):[clean,...polls]);setDraft(empty)};
  const remove=(id:string)=>{if(confirm("Delete this poll and all recorded votes?")){onChange(polls.filter(poll=>poll.id!==id));setDraft(empty)}};
  return <div className="managerGrid"><form className="adminCard" onSubmit={save}><h2>{editing?"Edit poll":"Create a poll"}</h2><p>Open weekly MVP, award or community ballots. Each player gets one changeable vote.</p><div className="formGrid"><label>Category<select value={draft.category} onChange={event=>setDraft({...draft,category:event.target.value})}>{["Weekly Award","Season Award","MVP Vote","Community Poll"].map(value=><option key={value}>{value}</option>)}</select></label><label>Status<select value={draft.status} onChange={event=>setDraft({...draft,status:event.target.value as LeaguePoll["status"]})}><option value="open">Open</option><option value="closed">Closed</option></select></label><label className="wide">Poll title<input required value={draft.title} onChange={event=>setDraft({...draft,title:event.target.value})} placeholder="Week 3 MVP"/></label><label className="wide">Description<textarea value={draft.description} onChange={event=>setDraft({...draft,description:event.target.value})}/></label><label className="wide">Deadline<input type="datetime-local" value={draft.deadline??""} onChange={event=>setDraft({...draft,deadline:event.target.value})}/></label><fieldset className="wide nomineePicker"><legend>Nominees</legend>{players.map(player=><label key={player.id}><input type="checkbox" checked={draft.nomineeIds.includes(player.id)} onChange={event=>setDraft({...draft,nomineeIds:event.target.checked?[...draft.nomineeIds,player.id]:draft.nomineeIds.filter(id=>id!==player.id)})}/>{player.name}</label>)}</fieldset></div><div className="formActions"><button className="primary">{editing?"Save poll":"Open poll"}</button>{editing&&<button className="secondary" type="button" onClick={()=>setDraft(empty)}>Cancel</button>}</div></form><ManageList title="League ballots" empty="No polls yet.">{polls.map(poll=><div className="manageRow" key={poll.id}><div><b>{poll.title}</b><small>{poll.status} · {poll.nomineeIds.length} nominees · {poll.votes.length} votes</small></div><button onClick={()=>setDraft({...poll,nomineeIds:[...poll.nomineeIds],votes:poll.votes.map(vote=>({...vote}))})}>Edit</button><button className="deleteLink" onClick={()=>remove(poll.id)}>Delete</button></div>)}</ManageList></div>;
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

function BrandManager({branding,onChange}:{branding:LeagueBranding;onChange:(branding:LeagueBranding)=>void}){
  const [draft,setDraft]=useState(branding);
  const [status,setStatus]=useState("");
  const save=(event:React.FormEvent)=>{event.preventDefault();onChange({...draft,wordmark:draft.wordmark.trim()||initialBranding.wordmark,tagline:draft.tagline.trim()||initialBranding.tagline});setStatus("Branding published for everyone.");setTimeout(()=>setStatus(""),2200);};
  return <div className="managerGrid"><form className="adminCard" onSubmit={save}><h2>League branding</h2><p>Control the official mark and wording shown throughout the app.</p><div className="brandPreview"><img src={draft.logoUrl||initialBranding.logoUrl} alt="Current league mark"/><div><b>{draft.wordmark||initialBranding.wordmark}</b><small>{draft.tagline||initialBranding.tagline}</small></div></div><div className="formGrid"><label className="wide">League wordmark<input maxLength={30} value={draft.wordmark} onChange={event=>setDraft({...draft,wordmark:event.target.value})}/></label><label className="wide">League tagline<input maxLength={50} value={draft.tagline} onChange={event=>setDraft({...draft,tagline:event.target.value})}/></label><div className="wide imagePicker"><b>Official league mark</b><div><label className="uploadButton">Choose replacement<input type="file" accept="image/*" onChange={async event=>{const file=event.target.files?.[0];if(!file)return;setStatus("Preparing mark…");try{setDraft({...draft,logoUrl:await compressImage(file)});setStatus("Mark ready — publish to save it.")}catch(error){setStatus(error instanceof Error?error.message:"Could not prepare mark")}event.target.value="";}}/></label><button className="secondary" type="button" onClick={()=>setDraft({...draft,logoUrl:initialBranding.logoUrl})}>Restore official mark</button></div><em>Square artwork works best. Uploads are resized automatically.</em></div></div><button className="primary" type="submit">Publish branding</button>{status&&<p className="brandStatus">{status}</p>}</form><section className="adminCard"><h2>Brand system</h2><p>The league identity remains separate from weekly sides or matchups.</p><img className="brandGuide" src="/ys-guys-brand-guide.jpeg" alt="Y's Guys official brand guide"/><div className="brandSwatches"><span><i className="navySwatch"/>Primary · #0A2D5E</span><span><i className="goldSwatch"/>Secondary · #C7A24D</span></div></section></div>;
}

function DataTools({data,sessionToken,onImport,onCloudRestore,onReset}:{data:LeagueData;sessionToken:string;onImport:(data:LeagueData)=>void;onCloudRestore:(data:LeagueData,updatedAt:string)=>void;onReset:()=>void}){
  const [history,setHistory]=useState<{revision:number;createdAt:string}[]>([]);
  const [historyStatus,setHistoryStatus]=useState("");
  const importFile=(event:React.ChangeEvent<HTMLInputElement>)=>{
    const file=event.target.files?.[0];if(!file)return;
    const reader=new FileReader();
    reader.onload=()=>{try{const parsed=JSON.parse(String(reader.result));if(!Array.isArray(parsed.players)||!Array.isArray(parsed.games)||!Array.isArray(parsed.awards)||!Array.isArray(parsed.seasons))throw new Error();if(confirm("Replace this device's league data with the selected backup?"))onImport({players:parsed.players,games:parsed.games,awards:parsed.awards,seasons:parsed.seasons,news:Array.isArray(parsed.news)?parsed.news:initialNews,runs:Array.isArray(parsed.runs)?parsed.runs:initialRuns,polls:Array.isArray(parsed.polls)?parsed.polls:initialPolls,history:Array.isArray(parsed.history)?parsed.history:initialHistory,branding:parsed.branding??initialBranding,rankings:Array.isArray(parsed.rankings)?parsed.rankings:initialRankings,submissions:Array.isArray(parsed.submissions)?parsed.submissions:initialSubmissions});}catch{alert("That file is not a valid Y's Guys backup.");}};
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

function MyPlayerPicker({players,selectedId,onSelect,onClose}:{players:Player[];selectedId:string;onSelect:(id:string)=>void;onClose:()=>void}){
  return <div className="modalBackdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className="myPlayerPicker" role="dialog" aria-modal="true" aria-labelledby="my-player-title"><button className="close" onClick={onClose} aria-label="Close">×</button><span>PERSONALIZE THE UNIVERSE</span><h2 id="my-player-title">Choose My Player</h2><p>This only remembers your selection on this device. It does not create an account or require a PIN.</p><div>{players.map(player=><button className={selectedId===player.id?"selected":""} onClick={()=>onSelect(player.id)} key={player.id}>{player.photoUrl?<img src={player.photoUrl} alt=""/>:<span className="avatar">{initials(player.name)}</span>}<b>{player.name}</b><small>{player.nickname} · {overallRating(player)} OVR</small>{selectedId===player.id&&<strong>✓</strong>}</button>)}</div>{selectedId&&<button className="secondary clearMyPlayer" onClick={()=>onSelect("")}>Clear My Player</button>}</section></div>;
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
.headerActions{display:flex;align-items:center;gap:8px}.myPlayerPill{border:1px solid #dbe1e9;background:white;color:${NAVY};padding:7px 11px;border-radius:999px;display:flex;align-items:center;gap:7px}.myPlayerPill .avatar{width:29px;height:29px;border-radius:50%}.myPlayerHome{width:100%;margin-top:18px;padding:18px 22px;border:1px solid #dbe2eb;border-radius:22px;background:white;color:${NAVY};display:flex;align-items:center;gap:15px;text-align:left;box-shadow:0 10px 24px rgba(20,40,70,.06)}.myPlayerHome>img,.myPlayerHome>span{width:62px;height:62px;border-radius:17px}.myPlayerHome>img{object-fit:cover}.myPlayerHome>span{display:grid;place-items:center;background:${NAVY};color:white;font-size:20px;font-weight:900}.myPlayerHome>div{flex:1}.myPlayerHome small{font-size:9px;letter-spacing:.13em;color:#9b7628;font-weight:900}.myPlayerHome h2{margin:3px 0}.myPlayerHome p{margin:0;color:#708096}.myPlayerPicker{position:relative;width:min(620px,100%);max-height:88vh;overflow:auto;background:white;border-radius:27px;padding:25px}.myPlayerPicker>span{font-size:10px;letter-spacing:.13em;color:#9b7628;font-weight:900}.myPlayerPicker>h2{font-size:30px;margin:7px 0}.myPlayerPicker>p{color:#6f7c8f}.myPlayerPicker>div{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.myPlayerPicker>div>button{display:grid;grid-template-columns:43px 1fr auto;align-items:center;gap:9px;padding:11px;border:1px solid #e1e6ed;background:#f8fafc;color:${NAVY};border-radius:14px;text-align:left}.myPlayerPicker>div>button.selected{background:#fff7dd;border-color:${GOLD}}.myPlayerPicker img{width:43px;height:43px;border-radius:12px;object-fit:cover}.myPlayerPicker b,.myPlayerPicker small{grid-column:2}.myPlayerPicker b{align-self:end}.myPlayerPicker small{align-self:start;color:#7a8698}.myPlayerPicker strong{grid-column:3;grid-row:1/3;color:#2b8656}.clearMyPlayer{width:100%}.commandHero{display:flex;justify-content:space-between;gap:22px;align-items:center;padding:26px;border-radius:23px;background:linear-gradient(135deg,#071d40,${NAVY});color:white}.commandHero span{font-size:10px;letter-spacing:.14em;color:#e5c873;font-weight:900}.commandHero h2{font-size:30px;margin:6px 0}.commandHero p{margin:0;color:#d5e0ed}.commandHero>div:last-child{display:grid;grid-template-columns:auto auto;align-items:center;gap:4px 10px;padding:15px;border-radius:16px;background:rgba(255,255,255,.1)}.commandHero strong{font-size:25px;color:#e5c873}.commandHero small{font-size:9px;font-weight:900}.commandGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:15px}.commandGrid button{display:flex;align-items:center;gap:10px;padding:17px;border:1px solid #e1e6ed;border-radius:17px;background:white;color:${NAVY};text-align:left}.commandGrid button>span{font-size:26px}.commandGrid button>div{display:flex;flex:1;flex-direction:column}.commandGrid small{color:#758196;margin-top:4px;line-height:1.3}.commandGrid i{font-style:normal;font-weight:900}
.analyticsTable{background:white;border:1px solid #e2e7ed;border-radius:22px;overflow:auto}.analyticsHead,.analyticsRow{min-width:700px;display:grid;grid-template-columns:minmax(150px,1fr) repeat(5,90px);align-items:center;gap:8px;padding:14px 18px;text-align:center}.analyticsHead{background:${NAVY};color:white;font-size:10px}.analyticsHead b,.analyticsRow>b{text-align:left}.analyticsRow{border-top:1px solid #edf0f4}.analyticsRow>b{display:flex;flex-direction:column}.analyticsRow small{color:#7d8899;margin-top:3px}.analyticsRow strong{color:#9b7628;font-size:20px}.analyticsNote{font-size:12px;color:#738095}.timeline{position:relative;margin-left:22px;padding-left:32px;border-left:3px solid #d9c27d}.timelineItem{position:relative;display:grid;grid-template-columns:1fr;background:white;border:1px solid #e2e7ed;border-radius:20px;padding:20px;margin-bottom:14px;box-shadow:0 8px 22px rgba(20,40,70,.05);overflow:visible}.timelineItem.withPhoto{grid-template-columns:180px 1fr;gap:18px}.timelineItem>img{width:180px;height:125px;object-fit:cover;border-radius:14px}.timelineIcon{position:absolute;left:-59px;top:20px;width:48px;height:48px;border-radius:15px;background:${NAVY};display:grid;place-items:center;font-size:21px;border:4px solid #f3f5f8}.timelineItem small{font-size:10px;letter-spacing:.1em;color:#9b7628;font-weight:900}.timelineItem h2{margin:5px 0;font-size:22px}.timelineItem p{margin:0;color:#687589;line-height:1.5}.voterSelect{display:flex;flex-direction:column;gap:7px;padding:18px;background:#fff8e5;border:1px solid #e5d29c;border-radius:17px;font-size:12px;font-weight:900;margin-bottom:17px}.voterSelect select{padding:13px;border:1px solid #d8c997;border-radius:11px;background:white;color:${NAVY};font:inherit}.pollGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}.pollCard{background:white;border:1px solid #e2e7ed;border-radius:24px;padding:22px;box-shadow:0 12px 28px rgba(20,40,70,.06)}.pollCard>header{display:flex;justify-content:space-between;color:#9b7628;font-size:10px;letter-spacing:.1em}.pollCard h2{font-size:25px;margin:10px 0 6px}.pollCard>p{color:#6d798c}.nomineeList{display:grid;gap:8px;margin-top:16px}.nomineeList>button{display:flex;align-items:center;gap:10px;border:1px solid #e0e5eb;background:#f8fafc;color:${NAVY};padding:11px;border-radius:14px;text-align:left}.nomineeList>button.selected{border-color:${GOLD};background:#fff8e4}.nomineeList>button>div{display:flex;flex:1;flex-direction:column}.nomineeList i{height:6px;background:#e3e7ec;border-radius:99px;overflow:hidden;margin-top:5px}.nomineeList em{display:block;height:100%;background:${GOLD}}.nomineeList strong,.nomineeList small{font-size:11px}.voteButton{width:100%}.pollCard footer{font-size:10px;color:#7a8596;margin-top:15px}.nomineePicker{border:1px solid #dbe1e9;border-radius:13px;padding:14px}.nomineePicker legend{font-size:12px;font-weight:900;color:#65738a}.nomineePicker label{display:inline-flex;flex-direction:row;margin:6px 12px 6px 0}.nomineePicker input{width:auto}.studioLayout{display:grid;grid-template-columns:.8fr 1.2fr;gap:22px;align-items:start}.studioLayout canvas{width:100%;height:auto;border-radius:24px;box-shadow:0 18px 45px rgba(7,28,62,.2)}.studioHelp{background:white;border:1px solid #e2e7ed;border-radius:22px;padding:22px}.studioHelp h2{margin-top:0}.studioHelp p{color:#6d798c;line-height:1.5}
.nextRunBanner{width:100%;margin-top:18px;padding:20px 24px;border:1px solid #dfc77f;border-radius:22px;background:linear-gradient(135deg,#fff9e9,#fff);color:${NAVY};display:flex;align-items:center;gap:22px;text-align:left;box-shadow:0 12px 28px rgba(65,48,12,.08)}.nextRunBanner>div:first-child{flex:1}.nextRunBanner span{font-size:10px;letter-spacing:.14em;color:#927022;font-weight:900}.nextRunBanner h2{margin:5px 0}.nextRunBanner p{margin:0;color:#69768a}.nextRunBanner>b{font-size:13px}.runCount{display:flex;flex-direction:column;align-items:center;min-width:62px}.runCount strong{font-size:30px}.runCount small{font-size:9px;font-weight:900;color:#2d8052}.runCount.maybe small{color:#9b7628}.runSelector{display:flex;gap:8px;overflow:auto;margin-bottom:14px}.runSelector button{border:1px solid #dce2ea;background:white;color:${NAVY};padding:10px 14px;border-radius:13px;font-weight:900;white-space:nowrap}.runSelector button small{display:block;margin-top:3px;color:#7c8798}.runSelector button.active{background:${NAVY};color:white}.attendanceHero{background:linear-gradient(135deg,#071f43,#134f87);color:white;border-radius:28px;padding:30px;display:flex;justify-content:space-between;align-items:center;gap:24px}.attendanceHero>div:first-child>span{font-size:10px;letter-spacing:.15em;color:#e8ca7c;font-weight:900}.attendanceHero h2{font-size:32px;margin:7px 0}.attendanceHero p{margin:0;color:#dbe5f1}.attendanceHero small{display:block;margin-top:13px;color:#dbe5f1}.attendanceHero.cancelled{background:linear-gradient(135deg,#4d2630,#7b3441)}.attendanceHero.locked{background:linear-gradient(135deg,#303b4d,#536174)}.attendanceTotals{display:flex;gap:10px}.attendanceTotals span{min-width:74px;padding:13px;background:rgba(255,255,255,.1);border-radius:14px;text-align:center;font-size:10px;font-weight:900}.attendanceTotals b{display:block;font-size:28px;color:#e8ca7c}.rsvpForm{margin-top:18px;background:white;border:1px solid #e1e6ed;border-radius:24px;padding:24px;box-shadow:0 12px 30px rgba(20,40,70,.07)}.rsvpForm h2{margin-top:0}.rsvpFields{display:grid;grid-template-columns:1fr 1fr;gap:12px}.rsvpForm label{display:flex;flex-direction:column;gap:7px;font-size:12px;font-weight:900;color:#647289}.rsvpForm input,.rsvpForm select{width:100%;padding:13px;border:1px solid #dbe1e9;border-radius:12px;font:inherit;color:${NAVY};background:white}.statusChoices{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin:15px 0}.statusChoices button{border:1px solid #dfe4eb;background:#f7f9fb;color:${NAVY};padding:14px;border-radius:14px;font-weight:900}.statusChoices button span{display:block;font-size:21px;margin-bottom:4px}.statusChoices button.active{background:${NAVY};color:white;border-color:${NAVY}}.honorNote{display:block;margin-top:10px;color:#7a8596}.lockedNotice{margin:18px 0;padding:16px;border-radius:15px;background:#fff3d5;color:#765b1f;font-weight:900}.rsvpGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:18px}.rsvpGroup{background:white;border:1px solid #e1e6ed;border-radius:20px;padding:18px}.rsvpGroup header{display:flex;justify-content:space-between;align-items:center;padding-bottom:12px;border-bottom:1px solid #edf0f4}.rsvpGroup header span{min-width:28px;height:28px;border-radius:999px;background:#e4f5e9;color:#247744;display:grid;place-items:center;font-weight:900}.rsvpGroup.maybe header span{background:#fff2cf;color:#8b681d}.rsvpGroup.out header span{background:#f3e8e8;color:#944141}.rsvpGroup>p{color:#8893a2}.rsvpPerson{display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid #edf0f4}.rsvpPerson:last-child{border-bottom:0}.rsvpPerson>div{display:flex;flex-direction:column;min-width:0}.rsvpPerson small{color:#7b8798;margin-top:3px;line-height:1.3}.calendarDay.sunday{background:#fffbef}.calendarRun{margin-top:7px;padding:7px;border-radius:8px;background:#e5f4e9;color:#256e46;font-size:10px}.calendarRun.locked{background:#edf0f4;color:#58677a}.calendarRun.cancelled{background:#f8e8e8;color:#963e3e}.calendarRun b,.calendarRun small{display:block}.calendarRun small{margin-top:3px;opacity:.8}
.featureNews.withImage{background-position:center;background-size:cover}.emptyNews{padding:22px;border-radius:16px;background:#f4f6f8;color:#758195}.communityGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:18px}.communityStory{overflow:hidden;background:white;border:1px solid #e2e7ee;border-radius:24px;box-shadow:0 12px 28px rgba(20,40,70,.07)}.communityStory>img,.storyFallback{width:100%;height:240px;object-fit:cover}.storyFallback{display:grid;place-items:center;background:linear-gradient(135deg,${NAVY},#1c568d);color:${GOLD};font-size:58px;font-weight:1000}.communityStory>div:last-child{padding:23px}.communityStory span{font-size:10px;letter-spacing:.13em;color:#987423;font-weight:900;text-transform:uppercase}.communityStory h2{margin:8px 0;font-size:25px}.communityStory p{color:#687589;line-height:1.55}.communityStory b{display:inline-block;margin-top:6px;padding:7px 9px;border-radius:999px;background:#f7edcf;color:#80611d;font-size:9px;letter-spacing:.1em}.communityStory.featured{grid-column:1/-1;display:grid;grid-template-columns:1.2fr 1fr}.communityStory.featured>img,.communityStory.featured>.storyFallback{height:360px}.communityEmpty{text-align:center;padding:55px;background:white;border:1px solid #e2e7ee;border-radius:24px}.communityEmpty span{font-size:45px}
.adminTabs{display:flex;gap:8px;overflow:auto;margin-bottom:16px}.adminTabs button{border:1px solid #dce2ea;background:white;color:${NAVY};padding:11px 15px;border-radius:999px;font-weight:900;white-space:nowrap}.adminTabs button.active{background:${NAVY};color:white}.managerGrid{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(320px,.85fr);gap:18px;align-items:start}.adminCard{background:white;border:1px solid #e1e6ed;border-radius:24px;padding:24px;box-shadow:0 12px 30px rgba(20,40,70,.07)}.adminCard h2{margin:0 0 6px;font-size:26px}.adminCard>p{margin:0 0 20px;color:#718096}.formGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.formGrid label{display:flex;flex-direction:column;gap:7px;font-size:12px;font-weight:900;color:#65738a}.formGrid input,.formGrid select,.formGrid textarea{width:100%;border:1px solid #dbe1e9;border-radius:12px;padding:13px;font:inherit;color:${NAVY};background:white}.formGrid textarea{min-height:110px;resize:vertical}.formGrid .wide{grid-column:1/-1}.formActions,.dataActions{display:flex;gap:10px;flex-wrap:wrap;align-items:center}.primary,.secondary,.danger,.uploadButton{border:0;border-radius:13px;padding:13px 17px;font-weight:900;margin-top:18px;cursor:pointer;font:inherit}.primary{background:${NAVY};color:white}.secondary,.uploadButton{background:#edf2f8;color:${NAVY}}.danger{background:#fff0f0;color:#a62e2e;border:1px solid #efcaca}.danger.compact{margin-top:18px;padding:11px 13px}.uploadButton input{display:none}.imagePicker{display:flex;flex-direction:column;gap:8px;padding:15px;border:1px dashed #cbd4e0;border-radius:14px;background:#f8fafc}.imagePicker>img{width:100%;max-height:250px;object-fit:cover;border-radius:13px}.imagePicker>div{display:flex;gap:8px;align-items:center}.imagePicker small{color:#247744}.imagePicker em{font-size:11px;color:#718096;font-style:normal}.checkLabel{flex-direction:row!important;align-items:center}.checkLabel input{width:auto}.manageList{max-height:690px;overflow:auto}.manageRow{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:9px;padding:13px 0;border-top:1px solid #edf0f4}.manageRow div{display:flex;flex-direction:column;min-width:0}.manageRow b,.manageRow small{overflow:hidden;text-overflow:ellipsis}.manageRow small{color:#7b8798;margin-top:3px}.manageRow button{border:0;background:#edf2f8;color:${NAVY};border-radius:10px;padding:8px 10px;font-weight:800}.manageRow .deleteLink{background:#fff0f0;color:#a62e2e}.runManageRow{grid-template-columns:minmax(0,1fr) auto auto auto}.newsManageRow{grid-template-columns:44px minmax(0,1fr) auto auto auto}.newsManageRow>img,.storyMini{width:44px;height:44px;border-radius:11px;object-fit:cover}.storyMini{display:grid;place-items:center;background:${NAVY};color:${GOLD};font-weight:900}.orderButtons{display:flex;gap:3px}.orderButtons button{padding:7px}.orderButtons button:disabled{opacity:.35}.historyStatus{color:#718096}.historyList{margin-top:14px;border:1px solid #e1e6ed;border-radius:14px;overflow:hidden}.historyList>div{display:flex;justify-content:space-between;align-items:center;padding:11px 13px;border-top:1px solid #edf0f4}.historyList>div:first-child{border-top:0}.historyList span{display:flex;flex-direction:column}.historyList small{color:#7b8798;margin-top:2px}.historyList button{border:0;background:#edf2f8;color:${NAVY};padding:8px 10px;border-radius:9px;font-weight:800}.securityNote{margin-top:20px;padding:16px;border-radius:15px;background:#fff8e8;display:flex;flex-direction:column;gap:5px;color:#775f25}.securityNote span{line-height:1.5}.toast{position:fixed;right:18px;bottom:92px;z-index:60;background:#133e72;color:white;padding:12px 16px;border-radius:14px;font-weight:900;box-shadow:0 14px 35px rgba(0,0,0,.2)}
.upcomingList{display:grid;gap:12px}.upcomingCard{display:flex;justify-content:space-between;align-items:center;gap:18px;padding:20px 22px;border-radius:20px;background:linear-gradient(135deg,#fff,#f7f0dd);border:1px solid #e4d5aa;box-shadow:0 10px 24px rgba(20,40,70,.05)}.upcomingCard span{font-size:12px;color:#8b6d27;font-weight:900}.upcomingCard h3{font-size:22px;margin:6px 0}.upcomingCard h3 em{font-size:12px;font-style:normal;color:#8893a2;margin:0 7px}.upcomingCard p{margin:0;color:#748095}.upcomingCard>b{font-size:10px;letter-spacing:.12em;background:${NAVY};color:white;padding:8px 10px;border-radius:999px}.boxScoreEditor{margin-top:20px;border-top:1px solid #e4e8ee;padding-top:18px}.boxScoreTitle{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}.boxScoreTitle div{display:flex;flex-direction:column}.boxScoreTitle small{color:#718096;margin-top:3px}.boxScoreTitle button{border:0;background:#edf2f8;color:${NAVY};padding:9px 11px;border-radius:10px;font-weight:800}.statLineEdit{display:grid;grid-template-columns:1.2fr .8fr repeat(4,62px) 36px;gap:7px;align-items:end;padding:9px 0;border-top:1px solid #edf0f4}.statLineEdit select,.statLineEdit input{width:100%;border:1px solid #dbe1e9;border-radius:9px;padding:9px;font:inherit;color:${NAVY};background:white}.statLineEdit label{font-size:9px;font-weight:900;color:#718096}.statLineEdit .deleteLink{height:38px;border:0;border-radius:9px;background:#fff0f0;color:#a62e2e;font-weight:900}.boxScorePublic{border-top:1px solid #edf0f4;margin-top:14px;padding-top:12px}.boxScorePublic summary{cursor:pointer;font-weight:900;color:#9b7628}.publicStatHead,.publicStatRow{display:grid;grid-template-columns:1fr repeat(4,42px);gap:5px;padding:8px 0;border-bottom:1px solid #edf0f4;text-align:center;font-size:12px}.publicStatHead{color:#7a8596;font-size:10px}.publicStatHead b,.publicStatRow b{text-align:left}.standingsTable{background:white;border:1px solid #e3e7ed;border-radius:22px;overflow:hidden;box-shadow:0 10px 24px rgba(20,40,70,.05)}.standingsHead,.standingsRow{display:grid;grid-template-columns:45px minmax(100px,1fr) repeat(5,70px);align-items:center;gap:8px;padding:14px 18px}.standingsHead{background:${NAVY};color:white;font-size:11px}.standingsRow{border-top:1px solid #edf0f4}.standingsRow strong{color:#9b7628}.hallGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:15px}.hallCard{border:1px solid #ddc98f;background:linear-gradient(145deg,#fff,#faf1d9);border-radius:23px;padding:24px;text-align:left;color:${NAVY};box-shadow:0 12px 28px rgba(80,61,18,.08)}.hallCard>span{font-size:38px}.hallCard small{display:block;color:#9b7628;font-weight:900;margin-top:12px}.hallCard h3{font-size:23px;margin:6px 0}.hallCard p{color:#718096}.hallCard b{display:inline-block;background:${NAVY};color:white;border-radius:999px;padding:7px 10px}
.backButton{border:0;background:none;color:${NAVY};font-weight:900;padding:8px 0 16px}.universeHero{display:grid;grid-template-columns:auto 1fr 280px;align-items:center;gap:25px;padding:34px;border-radius:28px;background:linear-gradient(135deg,#071c3e,${NAVY} 64%,#826522);color:white;box-shadow:0 22px 50px rgba(10,45,94,.22)}.ratingOrb{width:116px;height:116px;border-radius:32px;background:linear-gradient(145deg,#e3c16c,#9a7625);display:grid;place-items:center;align-content:center;color:#071f42;box-shadow:inset 0 0 0 5px rgba(255,255,255,.2)}.ratingOrb strong{font-size:48px;line-height:1}.ratingOrb small{font-weight:1000}.profilePhotoWrap{position:relative}.profilePhotoWrap img{width:130px;height:150px;object-fit:cover;border-radius:25px;border:3px solid #e7c977}.profilePhotoWrap b{position:absolute;right:-8px;bottom:-8px;background:${GOLD};color:${NAVY};padding:8px 10px;border-radius:11px}.universeIdentity>span{font-size:11px;letter-spacing:.14em;color:#e6ca82;font-weight:900}.universeIdentity h1{font-size:clamp(38px,6vw,64px);margin:5px 0 0;line-height:1}.universeIdentity p{margin:7px 0 15px;color:#d8e2ef}.profileTags{display:flex;gap:7px;flex-wrap:wrap}.profileTags b{font-size:9px;letter-spacing:.09em;padding:7px 9px;border-radius:999px;background:rgba(255,255,255,.12)}.legacyMeter{padding:19px;border-radius:18px;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.16)}.legacyMeter>div{display:flex;align-items:end;justify-content:space-between}.legacyMeter strong{font-size:35px;color:#e7c977}.legacyMeter small{font-weight:900}.legacyMeter>span,.attributeRow>span{display:block;height:8px;background:rgba(255,255,255,.16);border-radius:999px;overflow:hidden;margin:10px 0}.legacyMeter i,.attributeRow i{display:block;height:100%;background:#e7c977;border-radius:999px}.legacyMeter p{font-size:12px;color:#d5dfec;margin:0}.profileUniverseGrid{display:grid;grid-template-columns:1.15fr .85fr;gap:18px;margin-top:18px}.profilePanel{background:white;border:1px solid #e3e7ed;border-radius:23px;padding:4px 22px 22px;box-shadow:0 10px 24px rgba(20,40,70,.05)}.attributeRow{display:grid;grid-template-columns:110px 1fr 35px;align-items:center;gap:10px;padding:8px 0}.attributeRow>span{background:#e9edf2;margin:0}.attributeRow i{background:${NAVY}}.attributeRow strong{text-align:right}.profileHonor{display:flex;align-items:center;gap:10px;padding:13px 0;border-top:1px solid #edf0f4}.profileHonor span{font-size:24px}.profileGameLog{margin-top:18px}.logHead,.logRow{display:grid;grid-template-columns:1fr repeat(4,58px);align-items:center;text-align:center;gap:7px;padding:11px 0;border-top:1px solid #edf0f4}.logHead{font-size:10px;color:#718096}.logHead b,.logRow div{text-align:left}.logRow div{display:flex;flex-direction:column}.logRow small{color:#7c8798;margin-top:3px}.calendarControls{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.calendarControls button{width:42px;height:42px;border:1px solid #dfe4eb;background:white;border-radius:12px;color:${NAVY};font-weight:900}.calendarControls h2{margin:0}.calendar{background:white;border:1px solid #e1e6ed;border-radius:22px;overflow:hidden}.weekday,.calendarGrid{display:grid;grid-template-columns:repeat(7,1fr)}.weekday{background:${NAVY};color:white;padding:12px 0;text-align:center;font-size:11px}.calendarDay{min-height:125px;padding:9px;border-right:1px solid #edf0f4;border-bottom:1px solid #edf0f4}.calendarDay>span{font-size:11px;font-weight:900;color:#7a8597}.calendarDay.blank{background:#f7f8fa}.calendarGame{margin-top:7px;padding:7px;border-radius:8px;background:#fbf2d9;color:#72571e;font-size:10px}.calendarGame.final{background:#e9f0f8;color:${NAVY}}.calendarGame b,.calendarGame small{display:block}.calendarGame small{margin-top:3px;opacity:.75}.ruleHero{display:flex;align-items:center;gap:18px;padding:24px;border-radius:22px;background:${NAVY};color:white;margin-bottom:17px}.ruleHero>span{width:62px;height:62px;border-radius:18px;background:${GOLD};color:${NAVY};display:grid;place-items:center;font-weight:1000;font-size:21px}.ruleHero b{font-size:10px;letter-spacing:.15em;color:#e7c977}.ruleHero h2{margin:5px 0}.rulesGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}.ruleSection{background:white;border:1px solid #e3e7ed;border-radius:21px;padding:22px;box-shadow:0 10px 24px rgba(20,40,70,.05)}.ruleSection>div{display:flex;justify-content:space-between;align-items:center}.ruleSection>div span{font-size:30px}.ruleSection small{font-weight:900;color:#9b7628}.ruleSection h2{margin:10px 0}.ruleSection ol{padding-left:20px;color:#5f6d80;line-height:1.55}.ruleSection li{padding:5px 0}
.badgePanel{margin-top:18px}.badgeGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.playerBadge{display:flex;align-items:center;gap:10px;padding:13px;border-radius:14px;border:1px solid #dfe4eb;background:#f7f8fa}.playerBadge>span{font-size:26px}.playerBadge div{display:flex;flex-direction:column}.playerBadge small{color:#758195;margin-top:2px}.playerBadge.gold{background:#fff6d9;border-color:#e3ca79}.playerBadge.silver{background:#f0f3f6;border-color:#cbd2da}.playerBadge.bronze{background:#fbede5;border-color:#deb79f}.legacyTracker{background:white;border:1px solid #e3e7ed;border-radius:22px;padding:4px 18px}.legacyTracker button{width:100%;display:grid;grid-template-columns:32px 1fr 55px;align-items:center;gap:10px;border:0;border-top:1px solid #edf0f4;background:none;color:${NAVY};padding:13px 0;text-align:left}.legacyTracker button:first-child{border-top:0}.legacyTracker button>span{font-weight:900;color:#9b7628}.legacyTracker button>div{display:flex;flex-direction:column}.legacyTracker small{color:#788397;margin:2px 0 7px}.legacyTracker i{height:6px;background:#e8ecf1;border-radius:999px;overflow:hidden}.legacyTracker em{display:block;height:100%;background:linear-gradient(90deg,${NAVY},${GOLD});border-radius:999px}.legacyTracker strong{text-align:right}.compareSelectors{display:grid;grid-template-columns:1fr auto 1fr;align-items:end;gap:15px;margin-bottom:17px}.compareSelectors label{display:flex;flex-direction:column;gap:7px;font-size:11px;font-weight:900}.compareSelectors select{padding:13px;border:1px solid #dbe1e9;border-radius:12px;background:white;color:${NAVY};font:inherit}.compareSelectors>span{font-weight:1000;padding-bottom:13px;color:#9b7628}.compareHero{display:grid;grid-template-columns:1fr 70px 1fr;gap:14px;align-items:center}.compareIdentity{background:linear-gradient(145deg,#071c3e,${NAVY});color:white;border-radius:24px;padding:25px;text-align:center}.compareIdentity>div:first-child{width:78px;height:78px;margin:auto;border-radius:22px;background:${GOLD};color:${NAVY};display:grid;place-items:center;align-content:center;font-size:33px;font-weight:1000}.compareIdentity>div small{font-size:9px}.compareIdentity>span{display:block;margin-top:14px;font-size:10px;letter-spacing:.1em;color:#e7c977}.compareIdentity h2{font-size:28px;margin:5px 0}.compareIdentity p{color:#cfdaea}.miniBadgeRow{display:flex;justify-content:center;gap:7px}.miniBadgeRow i{width:34px;height:34px;border-radius:10px;background:rgba(255,255,255,.12);display:grid;place-items:center;font-style:normal}.versus{font-size:20px;font-weight:1000;text-align:center;color:#9b7628}.comparisonTable{background:white;border:1px solid #e3e7ed;border-radius:22px;padding:5px 20px;margin-top:16px}.comparisonHead,.comparisonRow{display:grid;grid-template-columns:1fr 110px 1fr;text-align:center;align-items:center;padding:13px 0;border-top:1px solid #edf0f4}.comparisonHead{border-top:0}.comparisonHead span,.comparisonRow span{font-size:10px;color:#778397;font-weight:900}.comparisonRow strong:first-child{text-align:right}.comparisonRow strong:last-child{text-align:left}.comparisonRow strong.winner{color:#9b7628;font-size:21px}
.brandMark{width:46px;height:46px;border-radius:14px;object-fit:cover;box-shadow:inset 0 0 0 1px rgba(10,45,94,.08)}.hero>div{position:relative;z-index:2}.heroWatermark{position:absolute;right:18%;bottom:-62px;width:260px;height:260px;object-fit:cover;border-radius:50%;mix-blend-mode:screen;opacity:.075;filter:grayscale(1);pointer-events:none}.brandPreview{display:flex;align-items:center;gap:16px;padding:18px;margin-bottom:18px;border-radius:18px;background:#f8f4e9;border:1px solid #e6d6a9}.brandPreview img{width:86px;height:86px;border-radius:22px;object-fit:cover}.brandPreview div{display:flex;flex-direction:column}.brandPreview b{font-size:25px;letter-spacing:.08em}.brandPreview small{color:#8d6d28;margin-top:5px}.brandGuide{display:block;width:100%;border-radius:16px;border:1px solid #eadfca}.brandSwatches{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:15px}.brandSwatches span{display:flex;align-items:center;gap:8px;font-size:11px;font-weight:900}.brandSwatches i{width:28px;height:28px;border-radius:9px}.navySwatch{background:#0A2D5E}.goldSwatch{background:#C7A24D}.brandStatus{color:#247744!important;margin:12px 0 0!important}
.hallEmpty{text-align:center;padding:48px 24px;border:1px solid #ddc98f;border-radius:24px;background:linear-gradient(145deg,#fff,#faf1d9)}.hallEmpty>span{font-size:48px}.hallEmpty h2{font-size:28px;margin:12px 0 6px}.hallEmpty p{color:#718096}.hallResumePanel{margin-top:18px}.hallSummary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:18px}.hallSummary span{display:flex;flex-direction:column;padding:16px;border-radius:15px;background:#f4f7fa;color:#718096;font-size:10px;font-weight:900;text-transform:uppercase}.hallSummary b{color:${NAVY};font-size:29px;margin-bottom:3px}.hallSummary span:last-child{background:${NAVY};color:#dbe5f1}.hallSummary span:last-child b{color:${GOLD}}.milestoneBannerGrid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.milestoneBanner{display:flex;align-items:center;gap:12px;padding:15px;border:1px solid #ddc98f;border-radius:16px;background:linear-gradient(135deg,#fff9e8,#fff)}.milestoneBanner>span{width:42px;height:42px;border-radius:13px;background:${GOLD};color:${NAVY};display:grid;place-items:center;font-size:20px}.milestoneBanner>div{display:flex;flex-direction:column}.milestoneBanner small{font-size:9px;letter-spacing:.09em;color:#967224;font-weight:900}.milestoneBanner b{margin:3px 0}.milestoneBanner em{font-size:10px;color:#718096;font-style:normal}.hallLedger{margin-top:18px;border-top:1px solid #edf0f4}.hallLedger h3{margin-bottom:7px}.hallLedger>div{display:flex;justify-content:space-between;padding:10px 0;border-top:1px solid #edf0f4}.hallLedger>div b{color:#9b7628}
.photoAvatar{object-fit:cover}.quickRsvp{margin:18px 0;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;padding:22px;border-radius:24px;background:white;border:1px solid #e1e6ed;box-shadow:0 12px 28px rgba(20,40,70,.08)}.quickRsvp span{font-size:10px;letter-spacing:.13em;color:#967224;font-weight:1000}.quickRsvp h2{margin:5px 0}.quickRsvp p{margin:0;color:#718096}.quickChoices{display:flex;gap:8px}.quickChoices button,.choosePlayerLink{border:1px solid #dce3eb;background:#f5f7fa;color:${NAVY};border-radius:12px;padding:12px 14px;font-weight:1000}.quickChoices button.active{background:${NAVY};color:white;border-color:${NAVY}}.choosePlayerLink{grid-column:1/-1}.updatedStamp{display:block;color:#7d8897;margin:-12px 0 14px}.powerList>button{width:100%;display:grid;grid-template-columns:42px 42px minmax(0,1fr) 52px;gap:9px;align-items:center;border:0;border-top:1px solid #e8ecf1;background:none;padding:12px 0;text-align:left;color:${NAVY}}.powerList>button:first-child{border-top:0}.powerList img{width:38px;height:38px;border-radius:11px;object-fit:cover}.powerRank{text-align:center;font-weight:1000}.powerIdentity{display:flex;flex-direction:column}.powerIdentity small{color:#778397;margin-top:3px;line-height:1.35}.moveUp{color:#16833c}.moveDown{color:#c53d37}.moveEven{color:#8993a0}.hallJump{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0 24px;position:sticky;top:76px;z-index:4;background:#f5f6f9;padding:8px}.hallJump a{background:white;border:1px solid #dce2ea;color:${NAVY};padding:9px 11px;border-radius:999px;font-size:11px;font-weight:900;text-decoration:none}#hall-progress,#record-book,#banner-hall,#awards-hall,#season-hall{scroll-margin-top:125px;margin-top:26px}.playerCardTop{display:flex;align-items:center;gap:10px;margin-bottom:12px}.playerCardTop .playerThumb,.playerPhotoPlaceholder{width:78px;height:78px;border-radius:20px;object-fit:cover}.playerPhotoPlaceholder{display:grid;place-items:center;background:#edf2f8;font-weight:1000}.playerCardTop .bigAvatar{margin:0;width:72px;height:72px;display:grid;place-items:center;align-content:center}.bigAvatar small{display:block;font-size:8px}.photoSubmit{margin-top:18px}.photoSubmit>p{color:#718096}.photoSubmit>img{width:120px;height:120px;object-fit:cover;border-radius:20px;display:block}.suggestionCard{max-width:720px;background:white;border:1px solid #e1e6ed;border-radius:24px;padding:24px;display:flex;flex-direction:column;gap:15px}.suggestionCard label{display:flex;flex-direction:column;gap:7px;font-weight:900}.suggestionCard select,.suggestionCard textarea{border:1px solid #dbe1e9;border-radius:12px;padding:13px;font:inherit}.suggestionCard textarea{min-height:150px;resize:vertical}.suggestionPreview{display:flex;align-items:flex-end;gap:10px}.suggestionPreview img{width:150px;height:120px;object-fit:cover;border-radius:15px}.suggestionPreview button{border:0;background:#fff0f0;color:#a62e2e;padding:9px;border-radius:9px}.privacyNote{color:#718096;font-size:12px}.successNote{padding:13px;border-radius:12px;background:#eaf7ee;color:#23733c;font-weight:900}.reviewItem{display:grid;grid-template-columns:150px 1fr;gap:18px;padding:18px 0;border-top:1px solid #e5e9ef}.reviewItem img{width:150px;height:150px;object-fit:cover;border-radius:18px}.reviewItem h3{margin:5px 0}.reviewItem p{color:#5f6d80}.reviewItem>div>div{display:flex;gap:7px;flex-wrap:wrap}.reviewItem button{margin-top:0}.rankingEditor{margin-top:18px}.rankingEditor article{display:grid;grid-template-columns:40px minmax(0,1fr) auto auto;gap:10px;align-items:center;padding:11px 0;border-top:1px solid #e5e9ef}.rankingEditor article>strong{font-size:20px;text-align:center}.rankingEditor article>span{display:flex;flex-direction:column;gap:5px}.rankingEditor textarea{width:100%;min-height:48px;border:1px solid #dbe1e9;border-radius:9px;padding:8px;font:inherit}.rankingEditor article>div{display:flex;gap:4px}.rankingEditor button{border:0;background:#edf2f8;color:${NAVY};border-radius:8px;padding:8px}.tradingCard{position:relative;min-height:470px;border:5px solid #d3ad55;background:linear-gradient(145deg,#fdf7e9,#fff 45%,#e9d39d);color:${NAVY};border-radius:24px;padding:28px 20px 24px;box-shadow:inset 0 0 0 2px ${NAVY},0 16px 34px rgba(25,39,60,.18);text-align:center}.cardCorner{position:absolute;left:15px;top:12px;font-size:9px;font-weight:1000;letter-spacing:.1em}.cardPortrait{height:230px;margin:10px 0 14px;border-radius:18px;overflow:hidden;background:linear-gradient(145deg,${NAVY},#173f69);position:relative;display:grid;place-items:center}.cardPortrait img{width:100%;height:100%;object-fit:cover}.cardPortrait>span{font-size:64px;color:#e9d39d;font-weight:1000}.cardPortrait>strong{position:absolute;right:10px;top:10px;background:${GOLD};padding:10px;border-radius:13px;font-size:28px}.cardPortrait small{display:block;font-size:8px}.cardName small{color:#8c6c25;font-weight:900}.cardName h2{margin:5px 0;font-size:30px}.cardName p{margin:0 0 10px}.flipHint{position:absolute;right:13px;bottom:10px;font-size:9px;font-weight:900}.cardBack{padding-top:30px}.cardBack>small{color:#987425;font-weight:1000}.cardBack h2{font-size:30px}.cardTotals{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.cardTotals span{background:#f1e4c4;border-radius:12px;padding:10px;font-size:9px;font-weight:900}.cardTotals b{display:block;font-size:24px}.cardBack h3{margin:18px 0 7px}.cardBack p{margin:7px}.majorHonor{color:#8d691c;font-weight:1000}.cardBack>strong{display:block;margin-top:18px;background:${NAVY};color:#e9cf87;padding:12px;border-radius:12px}
@media(max-width:900px){.leaderGrid,.exploreGrid,.playerGrid{grid-template-columns:repeat(2,1fr)}.twoCol,.managerGrid,.profileUniverseGrid,.studioLayout{grid-template-columns:1fr}.commandGrid{grid-template-columns:repeat(2,1fr)}.rsvpGrid{grid-template-columns:1fr}.universeHero{grid-template-columns:auto 1fr}.legacyMeter{grid-column:1/3}.recordGrid,.awardGrid{grid-template-columns:repeat(2,1fr)}.hallGrid{grid-template-columns:repeat(2,1fr)}.badgeGrid{grid-template-columns:repeat(2,1fr)}.statLineEdit{grid-template-columns:1fr 1fr repeat(4,55px) 36px}}
@media(max-width:640px){.formGrid,.rsvpFields{grid-template-columns:1fr}.formGrid .wide{grid-column:auto}.adminCard{padding:18px}.topbar{height:68px;padding:0 10px}.brand small,.seasonPill{display:none}.myPlayerPill b{display:none}.myPlayerPill{padding:6px}.commissionerStatus{align-items:flex-start;flex-direction:column}.commandHero{align-items:flex-start;flex-direction:column;padding:21px}.commandGrid{grid-template-columns:1fr}.myPlayerPicker>div{grid-template-columns:1fr}.myPlayerHome{align-items:flex-start;flex-wrap:wrap}.myPlayerHome>div{min-width:180px}.pollGrid{grid-template-columns:1fr}.timeline{margin-left:13px;padding-left:22px}.timelineItem.withPhoto{grid-template-columns:1fr}.timelineItem>img{width:100%;height:180px}.timelineIcon{left:-48px;width:40px;height:40px}.nextRunBanner{display:grid;grid-template-columns:1fr auto auto;padding:18px}.nextRunBanner>div:first-child{grid-column:1/-1}.nextRunBanner>b{grid-column:1/-1}.attendanceHero{align-items:flex-start;flex-direction:column;padding:23px}.attendanceTotals{width:100%}.attendanceTotals span{min-width:0;flex:1}.statusChoices{grid-template-columns:1fr}.runManageRow{grid-template-columns:repeat(3,1fr)}.runManageRow>div{grid-column:1/-1}.statLineEdit{grid-template-columns:1fr 1fr repeat(2,1fr) 36px}.statLineEdit label:nth-of-type(3),.statLineEdit label:nth-of-type(4){grid-row:2}.hallGrid,.rulesGrid,.badgeGrid,.communityGrid{grid-template-columns:1fr}.communityStory.featured{grid-column:auto;display:block}.communityStory.featured>img,.communityStory.featured>.storyFallback{height:240px}.newsManageRow{grid-template-columns:40px minmax(0,1fr) auto auto}.newsManageRow>.orderButtons{display:none}.newsManageRow>.deleteLink{grid-column:4}.universeHero{grid-template-columns:1fr;text-align:center;padding:25px}.ratingOrb{margin:auto}.profileTags{justify-content:center}.legacyMeter{grid-column:auto;text-align:left}.attributeRow{grid-template-columns:90px 1fr 30px}.compareSelectors{grid-template-columns:1fr}.compareSelectors>span{padding:0;text-align:center}.compareHero{grid-template-columns:1fr}.versus{padding:2px}.comparisonHead,.comparisonRow{grid-template-columns:1fr 80px 1fr}.calendar{overflow:auto}.weekday,.calendarGrid{min-width:760px}.calendarDay{min-height:110px}.logHead,.logRow{grid-template-columns:minmax(120px,1fr) repeat(4,42px)}main{padding:18px 14px 100px}.hero{grid-template-columns:1fr;padding:26px 22px;border-radius:24px}.hero h1{font-size:39px}.hero p{font-size:15px}.heroScore{display:none}.leaderGrid{grid-template-columns:repeat(2,1fr);gap:10px}.leaderCard{padding:14px}.leaderCard>strong{font-size:25px}.exploreGrid{grid-template-columns:1fr}.gameList,.playerGrid,.recordGrid,.awardGrid,.milestoneBannerGrid{grid-template-columns:1fr}.hallSummary{grid-template-columns:1fr}.pageHead h1{font-size:38px}.profileStats{grid-template-columns:repeat(2,1fr)}.newsRow{grid-template-columns:1fr;gap:3px}.recordHero{align-items:flex-start}.recordHero>span{font-size:40px}.seasonCard{align-items:flex-start;gap:12px}.bottomNav{height:70px}}
`;
