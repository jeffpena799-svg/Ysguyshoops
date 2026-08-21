import type { Plugin } from "vite";

function replaceRequired(source:string, search:string, replacement:string){
  if(!source.includes(search)) throw new Error(`Version 6.7 My Player patch could not find: ${search.slice(0,100)}`);
  return source.replace(search,replacement);
}

export function version67MyPlayer():Plugin{
  return {
    name:"ys-guys-version-67-my-player",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx")) return null;
      let code=source;

      code=replaceRequired(code,
        '{isMyPlayer&&nextRun&&<QuickRsvp run={nextRun} myPlayer={player} onChoosePlayer={()=>{}} onSubmit={onRsvp}/>}\n',
        ''
      );

      code=replaceRequired(code,
        '<div className="profileUniverseGrid"><section className="profilePanel"><Section eyebrow="PLAYER DNA" title="Attribute overview"/>{([["Scoring",components?.scoring],["Rebounding",components?.rebounding],["Playmaking",components?.playmaking],["Defense",components?.defense],["Ball Security",components?.ballSecurity]] as const).map(([label,raw])=>{const value=raw===undefined?null:Math.round(raw);return <div className="attributeRow" key={label}><b>{label}</b><span><i style={{width:`${value??0}%`}}/></span><strong>{value??"PROV"}</strong></div>})}<p className="bio">{player.bio}</p></section>\n  <section className="profilePanel"><Section eyebrow="TROPHY CASE" title="Awards & honors"/>{honors.length?honors.map(honor=><div className="profileHonor" key={honor}><span>🏆</span><b>{honor}</b></div>):<div className="empty">No official honors recorded yet.</div>}{player.strengths&&<><h4>Signature strengths</h4><p className="bio">{player.strengths}</p></>}</section></div>\n  {(()=>{const resume=hallResume(player,officialAwards),progress=hallProgress(resume.total);return <section className="profilePanel"><Section eyebrow="ROAD TO IMMORTALITY" title="Hall of Fame Progress"/><div className="attributeRow"><b>{formatHallValue(progress)}% complete</b><span><i style={{width:`${progress}%`}}/></span><strong>{resume.status}</strong></div><div className="miniStats hallBreakdown"><span><b>+{formatHallValue(resume.awardPoints)}%</b>Trophy credit</span><span><b>{resume.weeklyMvpCount}</b>Weekly MVPs</span><span><b>+{formatHallValue(resume.weeklyMvpPoints)}%</b>MVP credit</span><span><b>{formatHallValue(resume.total)}%</b>Total</span></div></section>})()}\n',
        '<section className="profilePanel playerDnaPanel"><Section eyebrow="PLAYER DNA" title="Attribute overview"/>{([["Scoring",components?.scoring],["Rebounding",components?.rebounding],["Playmaking",components?.playmaking],["Defense",components?.defense],["Ball Security",components?.ballSecurity]] as const).map(([label,raw])=>{const value=raw===undefined?null:Math.round(raw);return <div className="attributeRow" key={label}><b>{label}</b><span><i style={{width:`${value??0}%`}}/></span><strong>{value??"PROV"}</strong></div>})}<p className="bio">{player.bio}</p></section>\n  {(()=>{const resume=hallResume(player,officialAwards),progress=hallProgress(resume.total);const levels=["Career Beginning","Rising Player","Starter","Veteran","All-Star","League Legend","Hall of Fame"];const levelIndex=Math.min(levels.length-1,Math.floor(progress/16.67));return <section className="profilePanel legacyPanel"><Section eyebrow="CAREER LEGACY" title="Legacy"/><div className="legacyLevelHeader"><div><small>CURRENT LEVEL</small><h3>{levels[levelIndex]}</h3></div><strong>{formatHallValue(progress)}%</strong></div><div className="legacyLevelTrack"><i style={{width:`${progress}%`}}/></div><div className="legacyLevels">{levels.map((level,index)=><span className={index<=levelIndex?"reached":""} key={level}>{level}</span>)}</div><div className="legacySummary"><span><b>{honors.length}</b>Awards</span><span><b>{resume.weeklyMvpCount}</b>Weekly MVPs</span><span><b>{formatHallValue(resume.awardPoints)}%</b>Award credit</span><span><b>{formatHallValue(resume.total)}%</b>Legacy score</span></div><div className="legacyHonors">{honors.length?honors.map(honor=><div className="profileHonor" key={honor}><span>🏆</span><b>{honor}</b></div>):<div className="empty">No official honors recorded yet.</div>}</div></section>})()}\n'
      );

      code=replaceRequired(code,
        '  <section className="profilePanel badgePanel"><Section eyebrow="" title="Player badges"/><div className="badgeGrid">{playerBadges(player).map(badge=><article className={`playerBadge ${badge.level.toLowerCase()}`} key={badge.name}><span>{badge.icon}</span><div><b>{badge.name}</b><small>{badge.level} badge</small></div></article>)}</div></section>\n',
        ''
      );

      code=replaceRequired(code,
        'function MyPlayerPerformance({sessions}:{sessions:{session:SundaySession;line:SundayStatLine}[]}){\n  return <section className="myPlayerPerformance">\n    <Section eyebrow="LAST FIVE SUNDAYS" title="Recent performances"/>\n    {sessions.length?<div className="sundayLog"><div className="sundayLogHead"><b>Date</b><span>GP</span><span>Record</span><span>PTS</span><span>REB</span><span>AST</span><span>TO</span></div>{sessions.slice(0,5).map(({session,line})=><div key={session.id}><b>{localDate(session.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</b><span>{line.gp}</span><span>{line.wins}-{Math.max(0,line.gp-line.wins)}</span><span>{line.pts}</span><span>{line.reb}</span><span>{line.ast}</span><span>{line.turnovers}</span></div>)}</div>:<div className="empty">No published Sunday performances yet.</div>}\n  </section>;\n}',
        'function MyPlayerPerformance({sessions}:{sessions:{session:SundaySession;line:SundayStatLine}[]}){\n  const timeline=[...sessions].reverse();\n  return <section className="myPlayerPerformance careerTimeline"><Section eyebrow="CAREER STORY" title="Career timeline"/>{timeline.length?<div className="careerTimelineList">{timeline.map(({session,line},index)=><article key={session.id}><i/><div><small>{localDate(session.date).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})}</small><h3>{index===0?"League journey begins":"Sunday performance recorded"}</h3><p>{line.pts} PTS · {line.reb} REB · {line.ast} AST · {line.wins}-{Math.max(0,line.gp-line.wins)} record</p></div></article>)}</div>:<div className="empty">The first published Sunday performance will begin this career timeline.</div>}</section>;\n}'
      );

      code=replaceRequired(code,
        '  const categories=[["Points","pts"],["Rebounds","reb"],["Assists","ast"]] as const;',
        '  const categories=[["Points","pts"],["Rebounds","reb"],["Assists","ast"]] as const;'
      );
      code=replaceRequired(code,
        '{sessions.length?<div className="careerHighGrid">{highs.map(high=><article key={high.label}><small>CAREER HIGH</small><strong>{high.max}</strong><b>{high.label}</b><span>{high.dates.map(date=>localDate(date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})).join(" · ")||"—"}</span></article>)}</div>:<div className="empty">Career highs will appear after the first published Sunday Session.</div>}',
        '<div className="careerHighGrid">{highs.map(high=><article key={high.label}><small>CAREER HIGH</small><strong>{high.max||"—"}</strong><b>{high.label}</b><span>{high.dates.map(date=>localDate(date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})).join(" · ")||"No published high yet"}</span></article>)}<article><small>CAREER TOTAL</small><strong>{sessions.reduce((total,item)=>total+item.line.wins,0)}</strong><b>Wins</b><span>Published Sunday sessions</span></article></div>'
      );

      code=replaceRequired(code,
        '  return <><button className="backButton" onClick={onBack}>← All profiles</button>',
        '  return <><style>{`\n.profileHeroClean{min-height:25vh!important;max-height:360px!important;padding-block:22px!important}.playerDnaPanel{margin-top:16px}.legacyPanel{margin-top:16px}.legacyLevelHeader{display:flex;justify-content:space-between;align-items:end;gap:16px}.legacyLevelHeader small{color:#c7a24d;font-weight:900;letter-spacing:.12em}.legacyLevelHeader h3{font-size:clamp(25px,4vw,40px);margin:4px 0}.legacyLevelHeader strong{font-size:34px;color:#c7a24d}.legacyLevelTrack{height:12px;border-radius:999px;background:#142d4e;overflow:hidden;margin:14px 0}.legacyLevelTrack i{display:block;height:100%;background:linear-gradient(90deg,#8e6c22,#e4c56d);border-radius:inherit}.legacyLevels{display:grid;grid-template-columns:repeat(7,1fr);gap:5px}.legacyLevels span{font-size:10px;text-align:center;color:#71839a}.legacyLevels span.reached{color:#f5df9c;font-weight:900}.legacySummary{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:22px 0}.legacySummary span{padding:14px;border:1px solid rgba(199,162,77,.3);border-radius:12px;text-align:center}.legacySummary b{display:block;font-size:24px;color:#fff}.legacyHonors{display:grid;gap:8px}.careerHighGrid{grid-template-columns:repeat(4,minmax(0,1fr))!important}.careerTimelineList{position:relative;display:grid;gap:0;margin-top:15px}.careerTimelineList article{position:relative;display:grid;grid-template-columns:24px 1fr;gap:14px;padding:0 0 22px}.careerTimelineList article:before{content:"";position:absolute;left:6px;top:13px;bottom:-2px;width:2px;background:rgba(199,162,77,.3)}.careerTimelineList article:last-child:before{display:none}.careerTimelineList i{width:14px;height:14px;border-radius:50%;background:#c7a24d;box-shadow:0 0 0 5px rgba(199,162,77,.13)}.careerTimelineList h3{margin:2px 0 5px;color:#fff}.careerTimelineList small{color:#c7a24d;font-weight:800}.careerTimelineList p{margin:0;color:#aebdd0}@media(max-width:760px){.profileHeroClean{min-height:25vh!important;max-height:none!important}.legacyLevels{grid-template-columns:repeat(4,1fr)}.legacySummary,.careerHighGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}\n`}</style><button className="backButton" onClick={onBack}>← All profiles</button>'
      );

      code=replaceRequired(code,
        '</div><div className="legacyHonors">{honors.length?',
        '</div><p className="legacyMvpFormula">Weekly MVP boost: {resume.weeklyMvpCount} × 0.5% = {formatHallValue(resume.weeklyMvpPoints)}%</p><div className="legacyHonors">{honors.length?'
      );
      return {code,map:null};
    }
  };
}
