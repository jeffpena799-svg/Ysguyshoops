import type { Plugin } from "vite";

function replaceRequired(source:string,search:string,replacement:string){
  if(!source.includes(search))throw new Error(`Profile history patch could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

export function version71ProfileHistory():Plugin{
  return {
    name:"ys-guys-version-71-profile-history",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      let code=source;

      const logStart=code.indexOf('  <section className="profilePanel profileGameLog">');
      const logEndMarker='  <CareerBestSection sessions={playerSessions}/>';
      const logEnd=code.indexOf(logEndMarker,logStart);
      if(logStart<0||logEnd<0)throw new Error("Profile history patch could not locate the profile log");
      const replacement=`  <section className="profilePanel profileGameLog"><Section eyebrow="CAREER LOG" title="Recorded Sundays"/>{playerSessions.length?<div className="profileSundayLog">{playerSessions.slice(0,3).map(({session,line})=><article key={session.id}><div><b>{localDate(session.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</b><small>{line.gp} games · {line.wins}-{Math.max(0,line.gp-line.wins)}</small></div><p><span><strong>{line.pts}</strong>PTS</span><span><strong>{line.reb}</strong>REB</span><span><strong>{line.ast}</strong>AST</span><span><strong>{line.turnovers}</strong>TO</span><span><strong>{line.stocks===undefined&&line.stl===undefined&&line.blk===undefined?"—":defensiveTotal(line)}</strong>STL+BLK</span></p></article>)}</div>:<div className="empty">Your published Sunday stats will appear here automatically.</div>}</section>\n`;
      code=code.slice(0,logStart)+replacement+code.slice(logEnd);

      const bestStart=code.indexOf("function CareerBestSection(");
      const bestEnd=code.indexOf("const PLAYER_POSITIONS",bestStart);
      if(bestStart<0||bestEnd<0)throw new Error("Profile history patch could not locate career bests");
      const bestSection=`function CareerBestSection({sessions}:{sessions:{session:SundaySession;line:SundayStatLine}[]}){
  const categories=[
    {label:"PPG",value:(line:SundayStatLine)=>line.gp?line.pts/line.gp:0,eligible:()=>true},
    {label:"RPG",value:(line:SundayStatLine)=>line.gp?line.reb/line.gp:0,eligible:()=>true},
    {label:"APG",value:(line:SundayStatLine)=>line.gp?line.ast/line.gp:0,eligible:()=>true},
    {label:"STL+BLK/G",value:(line:SundayStatLine)=>line.gp?defensiveTotal(line)/line.gp:0,eligible:(line:SundayStatLine)=>line.stocks!==undefined||line.stl!==undefined||line.blk!==undefined},
  ];
  const highs=categories.map(category=>{
    const eligible=sessions.filter(item=>category.eligible(item.line));
    const best=eligible.reduce<{session:SundaySession;line:SundayStatLine}|undefined>((leader,item)=>!leader||category.value(item.line)>category.value(leader.line)?item:leader,undefined);
    return {label:category.label,value:best?Math.round(category.value(best.line)*10)/10:null,date:best?.session.date};
  });
  return <section className="profilePanel careerBests">
    <Section eyebrow="CAREER BESTS" title="Best Sunday averages"/>
    {sessions.length?<div className="careerHighGrid">{highs.map(high=><article key={high.label}><small>BEST RECORDED</small><strong>{high.value??"—"}</strong><b>{high.label}</b><span>{high.date?localDate(high.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}):"Tracking began recently"}</span></article>)}</div>:<div className="empty">Sunday averages will appear after the first published session.</div>}
  </section>;
}

`;
      code=code.slice(0,bestStart)+bestSection+code.slice(bestEnd);

      const profileCss=`
.profileSundayLog{display:grid;gap:9px}.profileSundayLog article{padding:10px 0;border-top:1px solid #edf0f4}.profileSundayLog article>div{display:flex;align-items:baseline;justify-content:space-between;gap:8px}.profileSundayLog article>div small{color:#7c8798}.profileSundayLog p{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin:7px 0 0}.profileSundayLog p span{font-size:8px;color:#718096;text-align:center}.profileSundayLog p strong{display:block;font-size:14px;color:#102746}.myPlayerCompactPage .profileSundayLog{gap:3px}.myPlayerCompactPage .profileSundayLog article{padding:4px 0}.myPlayerCompactPage .profileSundayLog article>div b{font-size:8px}.myPlayerCompactPage .profileSundayLog article>div small{font-size:6px}.myPlayerCompactPage .profileSundayLog p{gap:2px;margin-top:3px}.myPlayerCompactPage .profileSundayLog p span{font-size:5px}.myPlayerCompactPage .profileSundayLog p strong{font-size:10px}.myPlayerCompactPage .profileGameLog{overflow:hidden!important}
`;
      code=replaceRequired(code,"const styles = `",`const styles = \`${profileCss}`);
      return {code,map:null};
    }
  };
}
