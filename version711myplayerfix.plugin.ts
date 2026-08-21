import type { Plugin } from "vite";

export function version711MyPlayerFix():Plugin{
  return {name:"ys-guys-version-711-my-player-fix",enforce:"pre",transform(source,id){
    if(!id.endsWith('/src/App.tsx'))return null;
    const start=source.indexOf('function PlayerUniverseProfile(');
    const end=source.indexOf('\nfunction MyPlayerPerformance',start);
    if(start<0||end<0)throw new Error('Version 7.1.1 could not locate My Player profile');
    const fn=`function PlayerUniverseProfile({player,roster,games,sundaySessions,nextRun,officialAwards,rank,isMyPlayer,onRsvp,onPhotoSave,onPositionChange,onBack}:{player:Player;roster:Player[];games:Game[];sundaySessions:SundaySession[];nextRun?:SundayRun;officialAwards:Award[];rank:number;isMyPlayer:boolean;onRsvp:(runId:string,rsvp:Omit<RunRsvp,"updatedAt">)=>Promise<void>;onPhotoSave:(playerId:string,photoUrl:string)=>Promise<void>;onPositionChange:(playerId:string,position:string)=>Promise<void>;onBack:()=>void}){
  const safePlayer=player??roster[0];
  if(!safePlayer)return <div className="empty">Choose a player to open My Player.</div>;
  const safeAwards=Array.isArray(officialAwards)?officialAwards:[];
  const honors=[...new Set([...(Array.isArray(safePlayer.awards)?safePlayer.awards:[]),...safeAwards.filter(award=>awardBelongsToPlayer(award,safePlayer)).map(a=>\`${'${a.season} ${a.name}'}\`)])];
  const rating=overallRating(safePlayer,roster);
  const components=overallComponents(safePlayer,roster);
  const safeSessions=(Array.isArray(sundaySessions)?sundaySessions:[]).filter(session=>session&&typeof session.date==="string"&&Array.isArray(session.lines));
  const playerSessions=[...safeSessions].sort((a,b)=>String(b.date).localeCompare(String(a.date))).flatMap(session=>{const line=session.lines.find(item=>item&&item.playerId===safePlayer.id);return line?[{session,line}]:[]});
  const resume=hallResume(safePlayer,safeAwards),progress=hallProgress(resume.total);
  const levels=["Career Beginning","Rising Player","Starter","Veteran","All-Star","League Legend","Hall of Fame"];
  const levelIndex=Math.min(levels.length-1,Math.max(0,Math.floor(progress/16.67)));
  const highs=[
    ["Points",(line:SundayStatLine)=>line.pts??0],
    ["Rebounds",(line:SundayStatLine)=>line.reb??0],
    ["Assists",(line:SundayStatLine)=>line.ast??0],
    ["STL/BLK",(line:SundayStatLine)=>(line.steals??0)+(line.blocks??0)],
    ["Wins",(line:SundayStatLine)=>line.wins??0],
  ] as const;
  return <div className={isMyPlayer?"myPlayerCompactPage":""}>
    {!isMyPlayer&&<button className="backButton" onClick={onBack}>← All profiles</button>}
    <section className="universeHero profileHeroClean" style={safePlayer.bannerColor?{background:\`linear-gradient(135deg,#071c3e,${'${safePlayer.bannerColor}'})\`}:undefined}>
      {safePlayer.photoUrl?<div className="profilePhotoWrap"><img src={safePlayer.photoUrl} alt={\`${'${safePlayer.name} profile'}\`}/><b>{rating??"PROV"}{rating===null?"":" OVR"}</b></div>:<div className="ratingOrb"><strong>{rating??"PROV"}</strong><small>{rating===null?"RATING":"OVR"}</small></div>}
      <div className="universeIdentity"><span>{safePlayer.position} · {archetype(safePlayer)}</span><h1>{safePlayer.name}</h1><p>“{safePlayer.nickname}”</p><div className="profileTags"><b>#{rank} OVERALL</b><b>{safePlayer.wins}-{safePlayer.losses} RECORD</b><b>{pct(safePlayer)}% WIN</b></div></div>
    </section>
    <section className="profilePanel playerDnaPanel"><Section eyebrow="PLAYER DNA" title="Attribute overview"/>{([["Scoring",components?.scoring],["Rebounding",components?.rebounding],["Playmaking",components?.playmaking],["Defense",components?.defense],["Ball Security",components?.ballSecurity]] as const).map(([label,raw])=>{const value=raw===undefined?null:Math.round(raw);return <div className="attributeRow" key={label}><b>{label}</b><span><i style={{width:\`${'${value??0}%'}\`}}/></span><strong>{value??"PROV"}</strong></div>})}</section>
    <section className="profilePanel legacyPanel"><Section eyebrow="CAREER LEGACY" title="Legacy"/><div className="legacyLevelHeader"><div><small>CURRENT LEVEL</small><h3>{levels[levelIndex]}</h3></div><strong>{formatHallValue(progress)}%</strong></div><div className="legacyLevelTrack"><i style={{width:\`${'${progress}%'}\`}}/></div><div className="legacySummary"><span><b>{honors.length}</b>Awards</span><span><b>{resume.weeklyMvpCount}</b>Weekly MVPs</span><span><b>{formatHallValue(resume.awardPoints)}%</b>Award credit</span><span><b>{formatHallValue(resume.total)}%</b>Legacy score</span></div></section>
    <section className="profilePanel profileGameLog"><Section eyebrow="CAREER LOG" title="Sunday Sessions"/>{playerSessions.length?<><div className="logHead logHeadV7"><b>Sunday</b><span>W-L</span><span>PTS</span><span>REB</span><span>AST</span><span>STL/BLK</span></div>{playerSessions.slice(0,4).map(({session,line})=><div className="logRow logRowV7" key={session.id}><div><b>{localDate(session.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</b><small>{line.gp??0} GP</small></div><span>{line.wins??0}-{Math.max(0,(line.gp??0)-(line.wins??0))}</span><span>{line.pts??0}</span><span>{line.reb??0}</span><span>{line.ast??0}</span><span>{(line.steals??0)+(line.blocks??0)}</span></div>)}</>:<div className="empty">Published Sunday Sessions will appear here automatically.</div>}</section>
    <section className="profilePanel careerBests"><Section eyebrow="CAREER BESTS" title="Best single Sunday"/><div className="careerHighGrid careerHighGridV7">{highs.map(([label,get])=>{const max=playerSessions.length?Math.max(...playerSessions.map(item=>Number(get(item.line)||0))):0;return <article key={label}><small>CAREER HIGH</small><strong>{max||"—"}</strong><b>{label}</b></article>})}</div></section>
    {isMyPlayer&&<div className="compactProfileEditors"><PositionEditor player={safePlayer} onChange={onPositionChange}/><PhotoSubmission player={safePlayer} onSave={onPhotoSave}/></div>}
  </div>;
}`;
    let code=source.slice(0,start)+fn+source.slice(end);
    const anchor='const styles = `';
    if(!code.includes(anchor))throw new Error('Version 7.1.1 could not find styles');
    const css=`\n/* V7.1.1 stable My Player */\n@media(max-width:640px){.myPlayerCompactPage{height:calc(100dvh - 150px)!important;max-height:700px!important;overflow:hidden!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:minmax(118px,1.05fr) minmax(128px,1fr) minmax(138px,1.08fr) 68px!important;gap:7px!important}.myPlayerCompactPage>.profileHeroClean{grid-column:1/-1!important;grid-row:1!important;margin:0!important;min-height:0!important;height:100%!important}.myPlayerCompactPage>.playerDnaPanel{grid-column:1!important;grid-row:2!important}.myPlayerCompactPage>.legacyPanel{grid-column:2!important;grid-row:2!important}.myPlayerCompactPage>.profileGameLog{grid-column:1!important;grid-row:3!important}.myPlayerCompactPage>.careerBests{grid-column:2!important;grid-row:3!important}.myPlayerCompactPage>.compactProfileEditors{grid-column:1/-1!important;grid-row:4!important;margin:0!important;height:68px!important}.myPlayerCompactPage>.profilePanel{margin:0!important;min-height:0!important;height:100%!important;overflow:hidden!important}.myPlayerCompactPage .logHeadV7,.myPlayerCompactPage .logRowV7{grid-template-columns:minmax(54px,1fr) repeat(5,20px)!important;gap:2px!important;font-size:6px!important}.myPlayerCompactPage .careerHighGridV7{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:4px!important}.myPlayerCompactPage .careerHighGridV7 article:nth-child(n+5){display:none!important}}\n`;
    code=code.replace(anchor,anchor+css);
    return {code,map:null};
  }};
}
