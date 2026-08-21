import type { Plugin } from "vite";

function required(source:string,search:string,replacement:string,label:string){
  if(!source.includes(search)) throw new Error(`Version 7.1 could not find ${label}`);
  return source.replace(search,replacement);
}

export function version71CombinedDefense():Plugin{
  return {name:"ys-guys-version-71-combined-defense",enforce:"pre",transform(source,id){
    let code=source;
    if(id.endsWith("/src/App.tsx")){
      // Keep the V7 storage fields for backward compatibility, but treat them as one recorded stat everywhere.
      code=required(code,
        '<b>AST</b><b>STL</b><b>BLK</b><b>TO</b>',
        '<b>AST</b><b>STL/BLK</b><b>TO</b>',
        'weekly combined defense header');
      code=required(code,
        '(["gp","wins","pts","reb","ast","steals","blocks","turnovers"] as const)',
        '(["gp","wins","pts","reb","ast","steals","turnovers"] as const)',
        'weekly combined defense input');
      code=required(code,
        '<span>STL {before.steals??0} → <strong>{after.steals??0}</strong></span><span>BLK {before.blocks??0} → <strong>{after.blocks??0}</strong></span>',
        '<span>STL/BLK {(before.steals??0)+(before.blocks??0)} → <strong>{(after.steals??0)+(after.blocks??0)}</strong></span>',
        'weekly combined defense preview');
      code=required(code,
        'steals:Math.max(0,(player.steals??0)-(oldLine?.steals??0)+(newLine?.steals??0)),blocks:Math.max(0,(player.blocks??0)-(oldLine?.blocks??0)+(newLine?.blocks??0)),',
        'steals:Math.max(0,(player.steals??0)+(player.blocks??0)-((oldLine?.steals??0)+(oldLine?.blocks??0))+(newLine?.steals??0)),blocks:0,',
        'weekly combined defense calculation');

      // Old V7 entries with separate STL and BLK remain accurate: display/use their sum, while all new entries use the single STL/BLK field.
      code=required(code,
        'const categories=[["Points","pts"],["Rebounds","reb"],["Assists","ast"],["Steals","steals"],["Blocks","blocks"],["Wins","wins"]] as const;\n  const highs=categories.map(([label,key])=>{const max=sessions.length?Math.max(...sessions.map(item=>Number(item.line[key]??0))):0;const dates=sessions.filter(item=>Number(item.line[key]??0)===max&&max>0).map(item=>item.session.date);return {label,max,dates}});',
        'const safeSessions=Array.isArray(sessions)?sessions.filter(item=>item?.session&&item?.line):[];\n  const categories=[["Points",(line:SundayStatLine)=>line.pts],["Rebounds",(line:SundayStatLine)=>line.reb],["Assists",(line:SundayStatLine)=>line.ast],["STL/BLK",(line:SundayStatLine)=>(line.steals??0)+(line.blocks??0)],["Wins",(line:SundayStatLine)=>line.wins]] as const;\n  const highs=categories.map(([label,getValue])=>{const max=safeSessions.length?Math.max(...safeSessions.map(item=>Number(getValue(item.line)??0))):0;const dates=safeSessions.filter(item=>Number(getValue(item.line)??0)===max&&max>0).map(item=>item.session.date).filter(Boolean);return {label,max,dates}});',
        'safe combined career highs');
      code=required(code,
        '<span>AST</span><span>STL</span><span>BLK</span>',
        '<span>AST</span><span>STL/BLK</span>',
        'career log combined header');
      code=required(code,
        '<span>{line.ast}</span><span>{line.steals??0}</span><span>{line.blocks??0}</span>',
        '<span>{line.ast}</span><span>{(line.steals??0)+(line.blocks??0)}</span>',
        'career log combined value');

      // Harden My Player against malformed/legacy session rows so one old record cannot take down the entire tab.
      code=required(code,
        'const playerSessions=[...sundaySessions].sort((a,b)=>b.date.localeCompare(a.date)).flatMap(session=>{const line=session.lines.find(item=>item.playerId===player.id);return line?[{session,line}]:[]});',
        'const safeSundaySessions=Array.isArray(sundaySessions)?sundaySessions.filter(session=>session&&typeof session.date==="string"&&Array.isArray(session.lines)):[];\n  const playerSessions=[...safeSundaySessions].sort((a,b)=>String(b.date).localeCompare(String(a.date))).flatMap(session=>{const line=session.lines.find(item=>item&&item.playerId===player.id);return line?[{session,line}]:[]});',
        'safe My Player sessions');

      // V7.1 labels and compact layout: one fewer career-log/stat column.
      code=code.replaceAll('v7.0','v7.1');
      const styleAnchor='const styles = `';
      if(!code.includes(styleAnchor)) throw new Error('Version 7.1 could not find styles');
      const css=`\n/* Version 7.1 */\n.weeklyStatsTableV7 .weeklyStatsHead,.weeklyStatsTableV7>div:not(.weeklyStatsHead){grid-template-columns:40px minmax(110px,1fr) repeat(7,minmax(48px,64px))!important}.logHeadV7,.logRowV7{grid-template-columns:minmax(120px,1.5fr) repeat(5,minmax(42px,.5fr))!important}@media(max-width:760px){.weeklyStatsTableV7 .weeklyStatsHead,.weeklyStatsTableV7>div:not(.weeklyStatsHead){min-width:625px}.logHeadV7,.logRowV7{grid-template-columns:minmax(100px,1.4fr) repeat(5,minmax(32px,.45fr))!important}}\n`;
      code=code.replace(styleAnchor,styleAnchor+css);
      return {code,map:null};
    }
    if(id.endsWith('/src/components/AroundLeague.tsx')){
      code=required(code,'type PerGameSortKey="name"|"ppg"|"rpg"|"apg"|"spg"|"bpg"|"wins"|"losses";','type PerGameSortKey="name"|"ppg"|"rpg"|"apg"|"dpg"|"wins"|"losses";','per-game combined sort');
      code=required(code,'type TotalSortKey="name"|"pts"|"reb"|"ast"|"steals"|"blocks"|"wins"|"losses";','type TotalSortKey="name"|"pts"|"reb"|"ast"|"defense"|"wins"|"losses";','total combined sort');
      code=required(code,'apg:avg(p.ast,p),spg:avg(p.steals??0,p),bpg:avg(p.blocks??0,p),wins:p.wins,losses:p.losses','apg:avg(p.ast,p),dpg:avg((p.steals??0)+(p.blocks??0),p),wins:p.wins,losses:p.losses','per-game combined data');
      code=required(code,'ast:p.ast,steals:p.steals??0,blocks:p.blocks??0,wins:p.wins,losses:p.losses','ast:p.ast,defense:(p.steals??0)+(p.blocks??0),wins:p.wins,losses:p.losses','total combined data');
      code=required(code,'<th><button onClick={()=>setSort("spg")}>SPG{arrow("spg")}</button></th><th><button onClick={()=>setSort("bpg")}>BPG{arrow("bpg")}</button></th>','<th><button onClick={()=>setSort("dpg")}>STL/BLK PG{arrow("dpg")}</button></th>','per-game combined header');
      code=required(code,'<td>{avg(player.steals??0,player)}</td><td>{avg(player.blocks??0,player)}</td>','<td>{avg((player.steals??0)+(player.blocks??0),player)}</td>','per-game combined value');
      code=required(code,'<th><button onClick={()=>setTotalSort("steals")}>STL{totalArrow("steals")}</button></th><th><button onClick={()=>setTotalSort("blocks")}>BLK{totalArrow("blocks")}</button></th>','<th><button onClick={()=>setTotalSort("defense")}>STL/BLK{totalArrow("defense")}</button></th>','total combined header');
      code=required(code,'<td>{player.steals??0}</td><td>{player.blocks??0}</td>','<td>{(player.steals??0)+(player.blocks??0)}</td>','total combined value');
      return {code,map:null};
    }
    return null;
  }};
}
