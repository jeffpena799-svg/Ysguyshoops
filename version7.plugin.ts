import type { Plugin } from "vite";

function replaceRequired(source:string,search:string,replacement:string,label:string){
  if(!source.includes(search))throw new Error(`Version 7 could not find ${label}`);
  return source.replace(search,replacement);
}
function replaceFunction(source:string,name:string,replacement:string){
  const start=source.indexOf(`function ${name}(`);
  if(start<0)throw new Error(`Version 7 could not find ${name}`);
  const end=source.indexOf("\nfunction ",start+20);
  if(end<0)throw new Error(`Version 7 could not find end of ${name}`);
  return source.slice(0,start)+replacement+source.slice(end);
}

export function version7Foundation():Plugin{
  return {name:"ys-guys-version-7-foundation",enforce:"pre",transform(source,id){
    if(!id.endsWith("/src/App.tsx"))return null;
    let code=source;

    code=replaceRequired(code,
      'wins: number; losses: number; pts: number; reb: number; ast: number; turnovers: number;',
      'wins: number; losses: number; pts: number; reb: number; ast: number; turnovers: number; steals?:number; blocks?:number;',"Player stats");
    code=replaceRequired(code,
      'type StatLine = { playerId:string; team:string; pts:number; reb:number; ast:number; turnovers:number };',
      'type StatLine = { playerId:string; team:string; pts:number; reb:number; ast:number; turnovers:number; steals?:number; blocks?:number };',"StatLine");
    code=replaceRequired(code,
      'id:string; headline:string; summary:string; category:string; date:string;\n  imageUrl?:string; featured:boolean; published:boolean;',
      'id:string; headline:string; summary:string; body?:string; category:string; date:string;\n  imageUrl?:string; featured:boolean; published:boolean;',"NewsStory");
    code=replaceRequired(code,
      'playerId:string; gp:number; wins:number; pts:number; reb:number; ast:number; turnovers:number;',
      'playerId:string; gp:number; wins:number; pts:number; reb:number; ast:number; turnovers:number; steals?:number; blocks?:number;',"SundayStatLine");
    code=replaceRequired(code,
      'type PlayerStatBaseline = Record<string,{wins:number;losses:number;pts:number;reb:number;ast:number;turnovers:number}>;',
      'type PlayerStatBaseline = Record<string,{wins:number;losses:number;pts:number;reb:number;ast:number;turnovers:number;steals?:number;blocks?:number}>;',"PlayerStatBaseline");
    code=replaceRequired(code,
      'type View = "home" | "attendance" | "community" | "games" | "players" | "profile" | "compare" | "leaders" | "more" | "records" | "awards" | "seasons" | "calendar" | "rules" | "hof" | "timeline" | "voting" | "studio" | "commissioner";',
      'type View = "home" | "attendance" | "community" | "news" | "games" | "players" | "profile" | "compare" | "leaders" | "more" | "records" | "awards" | "seasons" | "calendar" | "rules" | "hof" | "timeline" | "voting" | "studio" | "commissioner";',"View type");

    code=replaceRequired(code,
      'return Object.fromEntries(players.map(player=>[player.id,{wins:player.wins,losses:player.losses,pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers}]));',
      'return Object.fromEntries(players.map(player=>[player.id,{wins:player.wins,losses:player.losses,pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers,steals:player.steals??0,blocks:player.blocks??0}]));',"stat baseline creation");
    code=replaceRequired(code,
      'const base=baseline[player.id]??{wins:player.wins,losses:player.losses,pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers};',
      'const base=baseline[player.id]??{wins:player.wins,losses:player.losses,pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers,steals:player.steals??0,blocks:player.blocks??0};',"ledger baseline");
    code=replaceRequired(code,
      'turnovers:base.turnovers+lines.reduce((sum,line)=>sum+line.turnovers,0),',
      'turnovers:base.turnovers+lines.reduce((sum,line)=>sum+line.turnovers,0),\n      steals:(base.steals??0)+lines.reduce((sum,line)=>sum+(line.steals??0),0),\n      blocks:(base.blocks??0)+lines.reduce((sum,line)=>sum+(line.blocks??0),0),',"Sunday ledger defense");

    code=replaceRequired(code,
      'const [showMyPlayerPicker,setShowMyPlayerPicker]=useState(false);',
      'const [showMyPlayerPicker,setShowMyPlayerPicker]=useState(false);\n  const [selectedNewsId,setSelectedNewsId]=useState("");',"news state");
    code=replaceRequired(code,
      'const openProfile=(player:Player)=>{setSelected(player);go("profile");};',
      'const openProfile=(player:Player)=>{setSelected(player);go("profile");};\n  const openNews=(storyId?:string)=>{setSelectedNewsId(storyId||featuredStory?.id||publishedNews[0]?.id||"");go("news");};',"open news");
    code=replaceRequired(code,
      'onNavigate={(target:any)=>go(target)}',
      'onNavigate={(target:any)=>go(target)}\n        onOpenNews={(storyId:string)=>openNews(storyId)}',"Home news handler");

    const newsView=`      {view==="news" && <LeagueNews news={publishedNews} selectedId={selectedNewsId} onSelect={setSelectedNewsId} onBack={()=>go("home")}/>}\n\n`;
    const newsAnchor='      {view==="calendar" && <CalendarView games={games} runs={runs}/>}';
    code=replaceRequired(code,newsAnchor,newsView+newsAnchor,"League News view");

    const leagueNewsFunction=`function LeagueNews({news,selectedId,onSelect,onBack}:{news:NewsStory[];selectedId:string;onSelect:(id:string)=>void;onBack:()=>void}){
  const story=news.find(item=>item.id===selectedId)??news[0];
  return <Page eyebrow="LEAGUE NEWS · VERSION 7" title="The league story." subtitle="Commissioner-published news preserved as part of Y's Guys history.">
    <button className="backButton" onClick={onBack}>← Home</button>
    {story?<div className="leagueNewsLayout"><article className="leagueNewsArticle">{story.imageUrl&&<img src={story.imageUrl} alt=""/>}<small>{story.category} · {story.date}</small><h2>{story.headline}</h2><p className="leagueNewsDek">{story.summary}</p><div className="leagueNewsBody">{(story.body||story.summary).split(/\\n+/).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div></article><aside className="leagueNewsArchive"><small>NEWS ARCHIVE</small>{news.map(item=><button className={item.id===story.id?"active":""} key={item.id} onClick={()=>onSelect(item.id)}><b>{item.headline}</b><span>{item.category} · {item.date}</span></button>)}</aside></div>:<div className="empty">No League News has been published yet.</div>}
  </Page>;
}

`;
    const insertBefore='function NewsManager(';
    const ni=code.indexOf(insertBefore);if(ni<0)throw new Error("Version 7 could not find NewsManager insert point");
    code=code.slice(0,ni)+leagueNewsFunction+code.slice(ni);

    code=replaceRequired(code,
      'const empty:NewsStory={id:"",headline:"",summary:"",category:"League News",date:new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),imageUrl:"",featured:false,published:true};',
      'const empty:NewsStory={id:"",headline:"",summary:"",body:"",category:"League News",date:new Date().toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"}),imageUrl:"",featured:false,published:true};',"news draft");
    code=replaceRequired(code,
      'const story={...draft,id:draft.id||makeId("story"),headline:draft.headline.trim(),summary:draft.summary.trim(),category:draft.category.trim()||"League News"};',
      'const story={...draft,id:draft.id||makeId("story"),headline:draft.headline.trim(),summary:draft.summary.trim(),body:(draft.body||draft.summary).trim(),category:draft.category.trim()||"League News"};',"news save");
    code=replaceRequired(code,
      '<label className="wide">Story summary<textarea required maxLength={700} value={draft.summary} onChange={e=>setDraft({...draft,summary:e.target.value})} placeholder="Tell the community the story…"/></label>',
      '<label className="wide">Home-page summary<textarea required maxLength={700} value={draft.summary} onChange={e=>setDraft({...draft,summary:e.target.value})} placeholder="Short preview for Home…"/></label><label className="wide">Full article<textarea maxLength={6000} value={draft.body??""} onChange={e=>setDraft({...draft,body:e.target.value})} placeholder="Write the complete League News story here. If left blank, the summary will be used as the article."/></label>',"news article field");

    const rankingFunction=`function PowerRankingManager({rankings,players,onChange}:{rankings:PowerRankingSnapshot[];players:Player[];onChange:(next:PowerRankingSnapshot[])=>void}){
  const latest=rankings[0]??initialRankings[0];
  const [week,setWeek]=useState(latest.week+1);const [date,setDate]=useState(new Date().toLocaleDateString("en-CA"));
  const [paste,setPaste]=useState("");const [message,setMessage]=useState("");
  const [entries,setEntries]=useState<RankingEntry[]>(()=>players.map((player,index)=>({playerId:player.id,playerName:player.name,rank:index+1,movement:0,dnp:false,reason:""})));
  const move=(index:number,delta:number)=>{const target=index+delta;if(target<0||target>=entries.length)return;const next=[...entries];[next[index],next[target]]=[next[target],next[index]];setEntries(next.map((entry,i)=>({...entry,rank:entry.dnp?null:i+1})))};
  const patch=(index:number,values:Partial<RankingEntry>)=>setEntries(current=>current.map((entry,i)=>i===index?{...entry,...values}:entry));
  const normalize=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]/g,"");
  const importRanking=()=>{
    const raw=paste.split(/\\n+/).map(line=>line.trim()).filter(Boolean);if(!raw.length)return setMessage("Paste one player per line first.");
    const used=new Set<string>();const matched:RankingEntry[]=[];const missed:string[]=[];
    raw.forEach(line=>{const cleaned=line.replace(/^#?\\s*\\d+\\s*[.)\\-:]?\\s*/,"").replace(/\\s+[—–-].*$/,"").trim();const key=normalize(cleaned);const player=players.find(item=>!used.has(item.id)&&(normalize(item.name)===key||normalize(item.nickname||"")===key||normalize(item.name).includes(key)||key.includes(normalize(item.name))));if(player){used.add(player.id);matched.push({playerId:player.id,playerName:player.name,rank:matched.length+1,movement:0,dnp:false,reason:"Commissioner ranking published."})}else missed.push(line)});
    const remainder=players.filter(player=>!used.has(player.id)).map(player=>({playerId:player.id,playerName:player.name,rank:null,movement:0,dnp:true,reason:"DNP"} as RankingEntry));
    setEntries([...matched,...remainder]);setMessage(missed.length?`Matched ${matched.length}. Check unmatched: ${missed.join(", ")}`:`Matched all ${matched.length} ranked players. Review the preview, then publish.`);
  };
  const publish=()=>{const ranked=entries.filter(entry=>!entry.dnp);if(!ranked.length)return setMessage("Add at least one ranked player.");const previous=new Map(latest.entries.filter(item=>item.playerId&&item.rank).map(item=>[item.playerId!,item.rank!]));let rank=0;const publishedEntries=entries.map(entry=>{if(entry.dnp)return {...entry,rank:null,movement:0,reason:"DNP"};rank++;const old=entry.playerId?previous.get(entry.playerId):undefined;return {...entry,rank,movement:old?old-rank:0,reason:entry.reason||"Commissioner ranking published."}});const published:PowerRankingSnapshot={id:makeId("power"),week,date,publishedAt:new Date().toISOString(),entries:publishedEntries};onChange([published,...rankings]);setWeek(value=>value+1);setMessage(`Week ${week} rankings published.`)};
  return <section className="adminCard"><Section eyebrow="VERSION 7 · ONE-PASTE PUBLISHER" title="Power Rankings"/><p>Paste the complete ranking in order. Player names are matched to the roster, movement is calculated from the previous published board, and the old ranking remains preserved.</p><div className="formGrid"><label>Week<input type="number" value={week} onChange={event=>setWeek(Number(event.target.value))}/></label><label>Ranking date<input type="date" value={date} onChange={event=>setDate(event.target.value)}/></label><label className="wide">Paste rankings<textarea className="rankingPaste" value={paste} onChange={event=>setPaste(event.target.value)} placeholder={"1. Steve\\n2. Paul Peters\\n3. Vic\\n4. Ty"}/></label></div><div className="formActions"><button className="primary" type="button" onClick={importRanking}>Build ranking preview</button></div>{message&&<p className="rankingImportMessage">{message}</p>}<div className="rankingEditor rankingPreview">{entries.map((entry,index)=><article key={entry.playerId}><strong>{entry.dnp?"DNP":entries.slice(0,index+1).filter(item=>!item.dnp).length}</strong><span><b>{entry.playerName}</b><textarea value={entry.reason} onChange={event=>patch(index,{reason:event.target.value})} placeholder="Optional ranking note"/></span><label><input type="checkbox" checked={entry.dnp} onChange={event=>patch(index,{dnp:event.target.checked,rank:event.target.checked?null:1})}/> DNP</label><div><button disabled={index===0} onClick={()=>move(index,-1)}>↑</button><button disabled={index===entries.length-1} onClick={()=>move(index,1)}>↓</button></div></article>)}</div><button className="primary" onClick={publish}>Publish Week {week} rankings</button></section>;
}`;
    code=replaceFunction(code,"PowerRankingManager",rankingFunction);

    code=replaceRequired(code,
      'const blankLines=()=>players.map(player=>({playerId:player.id,gp:0,wins:0,pts:0,reb:0,ast:0,turnovers:0,included:false}));',
      'const blankLines=()=>players.map(player=>({playerId:player.id,gp:0,wins:0,pts:0,reb:0,ast:0,turnovers:0,steals:0,blocks:0,included:false}));',"blank weekly lines");
    code=code.replaceAll('{playerId:player.id,gp:0,wins:0,pts:0,reb:0,ast:0,turnovers:0,included:false}','{playerId:player.id,gp:0,wins:0,pts:0,reb:0,ast:0,turnovers:0,steals:0,blocks:0,included:false}');
    code=replaceRequired(code,
      'if([line.pts,line.reb,line.ast,line.turnovers].some(value=>value>500))',
      'if([line.pts,line.reb,line.ast,line.turnovers,line.steals??0,line.blocks??0].some(value=>value>500))',"weekly validation");
    code=replaceRequired(code,
      'turnovers:Math.max(0,player.turnovers-(oldLine?.turnovers??0)+(newLine?.turnovers??0)),',
      'turnovers:Math.max(0,player.turnovers-(oldLine?.turnovers??0)+(newLine?.turnovers??0)),steals:Math.max(0,(player.steals??0)-(oldLine?.steals??0)+(newLine?.steals??0)),blocks:Math.max(0,(player.blocks??0)-(oldLine?.blocks??0)+(newLine?.blocks??0)),',"weekly preview defense");
    code=replaceRequired(code,
      '<div className="weeklyStatsTable"><div className="weeklyStatsHead"><b>Use</b><b>Player</b><b>GP</b><b>W</b><b>PTS</b><b>REB</b><b>AST</b><b>TO</b></div>',
      '<div className="weeklyStatsTable weeklyStatsTableV7"><div className="weeklyStatsHead"><b>Use</b><b>Player</b><b>GP</b><b>W</b><b>PTS</b><b>REB</b><b>AST</b><b>STL</b><b>BLK</b><b>TO</b></div>',"weekly headers");
    code=replaceRequired(code,
      '(["gp","wins","pts","reb","ast","turnovers"] as const)',
      '(["gp","wins","pts","reb","ast","steals","blocks","turnovers"] as const)',"weekly inputs");
    code=replaceRequired(code,
      '<span>TO {before.turnovers} → <strong>{after.turnovers}</strong></span><span>OVR',
      '<span>STL {before.steals??0} → <strong>{after.steals??0}</strong></span><span>BLK {before.blocks??0} → <strong>{after.blocks??0}</strong></span><span>TO {before.turnovers} → <strong>{after.turnovers}</strong></span><span>OVR',"preview defense stats");

    const careerBest=`function CareerBestSection({sessions}:{sessions:{session:SundaySession;line:SundayStatLine}[]}){
  const categories=[["Points","pts"],["Rebounds","reb"],["Assists","ast"],["Steals","steals"],["Blocks","blocks"],["Wins","wins"]] as const;
  const highs=categories.map(([label,key])=>{const max=sessions.length?Math.max(...sessions.map(item=>Number(item.line[key]??0))):0;const dates=sessions.filter(item=>Number(item.line[key]??0)===max&&max>0).map(item=>item.session.date);return {label,max,dates}});
  return <section className="profilePanel careerBestPanel"><Section eyebrow="CAREER BESTS" title="Best single Sunday"/><div className="careerHighGrid careerHighGridV7">{highs.map(high=><article key={high.label}><small>CAREER HIGH</small><strong>{high.max||"—"}</strong><b>{high.label}</b><span>{high.dates.map(date=>localDate(date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})).join(" · ")||"No published high yet"}</span></article>)}</div></section>;
}`;
    code=replaceFunction(code,"CareerBestSection",careerBest);

    const oldLog='<section className="profilePanel profileGameLog"><Section eyebrow="CAREER LOG" title="Recorded box scores"/>{logs.length?<><div className="logHead"><b>Game</b><span>PTS</span><span>REB</span><span>AST</span><span>TO</span></div>{logs.map(({game,line})=><div className="logRow" key={game.id}><div><b>{game.title}</b><small>{game.date} · {line.team}</small></div><span>{line.pts}</span><span>{line.reb}</span><span>{line.ast}</span><span>{line.turnovers}</span></div>)}</>:<div className="empty">Future Game Day box scores will appear here automatically.</div>}</section>';
    const newLog='<section className="profilePanel profileGameLog"><Section eyebrow="CAREER LOG" title="Sunday Sessions"/>{playerSessions.length?<><div className="logHead logHeadV7"><b>Sunday</b><span>W-L</span><span>PTS</span><span>REB</span><span>AST</span><span>STL</span><span>BLK</span></div>{playerSessions.map(({session,line})=><div className="logRow logRowV7" key={session.id}><div><b>{localDate(session.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})}</b><small>{line.gp} games played</small></div><span>{line.wins}-{Math.max(0,line.gp-line.wins)}</span><span>{line.pts}</span><span>{line.reb}</span><span>{line.ast}</span><span>{line.steals??0}</span><span>{line.blocks??0}</span></div>)}</>:<div className="empty">Published Sunday Sessions will appear here automatically.</div>}</section>';
    code=replaceRequired(code,oldLog,newLog,"My Player Career Log");

    code=replaceRequired(code,
      '{numberField("wins")}{numberField("losses")}{numberField("pts")}{numberField("reb")}{numberField("ast")}{numberField("turnovers")}',
      '{numberField("wins")}{numberField("losses")}{numberField("pts")}{numberField("reb")}{numberField("ast")}<label>Steals<input min="0" type="number" value={draft.steals??0} onChange={e=>setDraft({...draft,steals:Number(e.target.value)})}/></label><label>Blocks<input min="0" type="number" value={draft.blocks??0} onChange={e=>setDraft({...draft,blocks:Number(e.target.value)})}/></label>{numberField("turnovers")}',"Player manager defense fields");

    code=code.replace('const defensiveRecord=sourceRecord("Most Blocks / Steals")??sourceRecord("Most Blocks/Steals")??sourceRecord("Most Blocks")??sourceRecord("Most Steals");','const stealsLeader=[...recordEligible].sort((a,b)=>(b.steals??0)-(a.steals??0))[0];const blocksLeader=[...recordEligible].sort((a,b)=>(b.blocks??0)-(a.blocks??0))[0];');
    code=code.replace('defensiveRecord?{...defensiveRecord,category:"Career",label:"Most Blocks / Steals",date:defensiveRecord.date||"Official recorded totals"}:{category:"Career",label:"Most Blocks / Steals",holder:"—",value:"—",date:"Awaiting recorded blocks / steals"}','{category:"Career",label:"Most Steals",holder:stealsLeader?.name??"—",value:stealsLeader?String(stealsLeader.steals??0):"—",date:"Minimum 20 games played"},{category:"Career",label:"Most Blocks",holder:blocksLeader?.name??"—",value:blocksLeader?String(blocksLeader.blocks??0):"—",date:"Minimum 20 games played"}');

    const styleAnchor='const styles = `';if(!code.includes(styleAnchor))throw new Error("Version 7 could not find styles");
    const css=`\n.leagueNewsLayout{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:18px}.leagueNewsArticle,.leagueNewsArchive{background:#fff;border:1px solid #e5e8ed;border-radius:20px;padding:18px;color:#172235}.leagueNewsArticle>img{width:100%;max-height:440px;object-fit:cover;border-radius:15px;margin-bottom:14px}.leagueNewsArticle>small,.leagueNewsArchive>small{color:#9a7628;font-size:9px;font-weight:1000;letter-spacing:.13em}.leagueNewsArticle h2{font-size:clamp(28px,5vw,54px);line-height:.98;margin:7px 0 10px;color:#172235}.leagueNewsDek{font-size:16px;font-weight:800;color:#445268}.leagueNewsBody p{font-size:14px;line-height:1.7;color:#303c4d}.leagueNewsArchive{display:grid;gap:7px;align-content:start}.leagueNewsArchive button{border:1px solid #edf0f4;background:#fbfcfe;border-radius:11px;padding:10px;text-align:left;color:#172235;display:grid;gap:3px}.leagueNewsArchive button.active{border-color:#c7a24d;background:#fbf7eb}.leagueNewsArchive button span{font-size:8px;color:#788497}.rankingPaste{min-height:170px!important}.rankingImportMessage{padding:10px 12px;border-radius:10px;background:#eef4fb;color:#21344d;font-weight:800}.weeklyStatsTableV7 .weeklyStatsHead,.weeklyStatsTableV7>div:not(.weeklyStatsHead){grid-template-columns:40px minmax(110px,1fr) repeat(8,minmax(48px,64px))!important}.logHeadV7,.logRowV7{grid-template-columns:minmax(120px,1.5fr) repeat(6,minmax(42px,.5fr))!important}.careerHighGridV7{grid-template-columns:repeat(3,minmax(0,1fr))!important}@media(max-width:760px){.leagueNewsLayout{grid-template-columns:1fr}.leagueNewsArchive{order:2}.weeklyStatsTableV7{overflow-x:auto}.weeklyStatsTableV7 .weeklyStatsHead,.weeklyStatsTableV7>div:not(.weeklyStatsHead){min-width:680px}.logHeadV7,.logRowV7{grid-template-columns:minmax(100px,1.4fr) repeat(6,minmax(32px,.45fr))!important;font-size:8px}.careerHighGridV7{grid-template-columns:repeat(3,minmax(0,1fr))!important}}\n`;
    code=code.replace(styleAnchor,styleAnchor+css);
    code=code.replaceAll('v6.3.1','v7.0');
    return {code,map:null};
  }};
}
