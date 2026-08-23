import type { Plugin } from "vite";

function replaceRequired(source:string,search:string,replacement:string){
  if(!source.includes(search))throw new Error(`Defensive stats patch could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

function replaceAllRequired(source:string,search:string,replacement:string){
  if(!source.includes(search))throw new Error(`Defensive stats patch could not find: ${search.slice(0,120)}`);
  return source.split(search).join(replacement);
}

export function version70DefensiveStats():Plugin{
  return {
    name:"ys-guys-version-7-defensive-stats",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      let code=source;

      code=replaceRequired(code,
        "wins: number; losses: number; pts: number; reb: number; ast: number; turnovers: number;",
        "wins: number; losses: number; pts: number; reb: number; ast: number; turnovers: number; stocks?:number; stl?:number; blk?:number; defensiveGp?:number;"
      );
      code=replaceRequired(code,
        "type StatLine = { playerId:string; team:string; pts:number; reb:number; ast:number; turnovers:number };",
        "type StatLine = { playerId:string; team:string; pts:number; reb:number; ast:number; turnovers:number; stocks?:number; stl?:number; blk?:number };"
      );
      code=replaceRequired(code,
        "playerId:string; gp:number; wins:number; pts:number; reb:number; ast:number; turnovers:number;",
        "playerId:string; gp:number; wins:number; pts:number; reb:number; ast:number; turnovers:number; stocks?:number; stl?:number; blk?:number;"
      );
      code=replaceRequired(code,
        "type PlayerStatBaseline = Record<string,{wins:number;losses:number;pts:number;reb:number;ast:number;turnovers:number}>;",
        "type PlayerStatBaseline = Record<string,{wins:number;losses:number;pts:number;reb:number;ast:number;turnovers:number;stocks?:number;stl?:number;blk?:number;defensiveGp?:number}>;"
      );

      code=replaceRequired(code,
        "function avg(v:number,p:Player){ return gp(p) ? Math.round((v/gp(p))*10)/10 : 0; }",
        "function avg(v:number,p:Player){ return gp(p) ? Math.round((v/gp(p))*10)/10 : 0; }\nfunction defensiveTotal(entry:{stocks?:number;stl?:number;blk?:number}){ return entry.stocks??((entry.stl??0)+(entry.blk??0)); }\nfunction defensiveAvg(entry:{stocks?:number;stl?:number;blk?:number},p:Player){ return p.defensiveGp ? Math.round((defensiveTotal(entry)/p.defensiveGp)*10)/10 : 0; }"
      );
      code=replaceRequired(code,
        "return Object.fromEntries(players.map(player=>[player.id,{wins:player.wins,losses:player.losses,pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers}]));",
        "return Object.fromEntries(players.map(player=>[player.id,{wins:player.wins,losses:player.losses,pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers,stocks:defensiveTotal(player),defensiveGp:player.defensiveGp??0}]));"
      );
      code=replaceRequired(code,
        "const base=baseline[player.id]??{wins:player.wins,losses:player.losses,pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers};",
        "const base=baseline[player.id]??{wins:player.wins,losses:player.losses,pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers,stocks:defensiveTotal(player),defensiveGp:player.defensiveGp??0};"
      );
      code=replaceRequired(code,
        "turnovers:base.turnovers+lines.reduce((sum,line)=>sum+line.turnovers,0),",
        "turnovers:base.turnovers+lines.reduce((sum,line)=>sum+line.turnovers,0),\n      stocks:defensiveTotal(base)+lines.reduce((sum,line)=>sum+defensiveTotal(line),0),\n      defensiveGp:(base.defensiveGp??0)+lines.reduce((sum,line)=>sum+(line.stocks!==undefined||line.stl!==undefined||line.blk!==undefined?line.gp:0),0),"
      );
      code=replaceRequired(code,
        "pts:Math.max(0,player.pts+line.pts*multiplier),reb:Math.max(0,player.reb+line.reb*multiplier),ast:Math.max(0,player.ast+line.ast*multiplier),turnovers:Math.max(0,player.turnovers+line.turnovers*multiplier),",
        "pts:Math.max(0,player.pts+line.pts*multiplier),reb:Math.max(0,player.reb+line.reb*multiplier),ast:Math.max(0,player.ast+line.ast*multiplier),turnovers:Math.max(0,player.turnovers+line.turnovers*multiplier),stocks:Math.max(0,defensiveTotal(player)+defensiveTotal(line)*multiplier),defensiveGp:Math.max(0,(player.defensiveGp??0)+((line.stocks!==undefined||line.stl!==undefined||line.blk!==undefined)?multiplier:0)),"
      );

      code=replaceRequired(code,
        'const [leaderKey,setLeaderKey]=useState<"pts"|"reb"|"ast"|"wins">("pts");',
        'const [leaderKey,setLeaderKey]=useState<"pts"|"reb"|"ast"|"stocks"|"wins">("pts");'
      );
      code=replaceRequired(code,
        "const ranked=useMemo(()=>[...players].sort((a,b)=>b[leaderKey]-a[leaderKey]),[leaderKey]);",
        "const ranked=useMemo(()=>[...players].sort((a,b)=>(b[leaderKey]??0)-(a[leaderKey]??0)),[players,leaderKey]);"
      );
      code=replaceRequired(code,
        "([['pts','PTS'],['reb','REB'],['ast','AST'],['wins','WINS']] as const)",
        "([['pts','PTS'],['reb','REB'],['ast','AST'],['stocks','STL+BLK'],['wins','WINS']] as const)"
      );

      code=replaceRequired(code,
        '<div className="profileTags"><b>#{rank} OVERALL</b><b>{player.wins}-{player.losses} RECORD</b><b>{pct(player)}% WIN</b>',
        '<div className="profileTags"><b>#{rank} OVERALL</b><b>{player.wins}-{player.losses} RECORD</b><b>{pct(player)}% WIN</b><b>{defensiveTotal(player)} STL+BLK</b>'
      );
      code=replaceRequired(code,
        '["APG",avg(left.ast,left),avg(right.ast,right)],',
        '["APG",avg(left.ast,left),avg(right.ast,right)],\n    ["STL+BLK/G",defensiveAvg(left,left),defensiveAvg(right,right)],'
      );
      code=replaceRequired(code,
        '<div className="miniStats"><span><b>{avg(player.pts,player)}</b>PPG</span><span><b>{avg(player.reb,player)}</b>RPG</span><span><b>{avg(player.ast,player)}</b>APG</span></div>',
        '<div className="miniStats"><span><b>{avg(player.pts,player)}</b>PPG</span><span><b>{avg(player.reb,player)}</b>RPG</span><span><b>{avg(player.ast,player)}</b>APG</span><span><b>{defensiveAvg(player,player)}</b>STL+BLK/G</span></div>'
      );
      code=replaceRequired(code,
        '<p>{line.pts} PTS · {line.reb} REB · {line.ast} AST · {line.wins}-{Math.max(0,line.gp-line.wins)} record</p>',
        '<p>{line.pts} PTS · {line.reb} REB · {line.ast} AST · {defensiveTotal(line)} STL+BLK · {line.wins}-{Math.max(0,line.gp-line.wins)} record</p>'
      );

      code=replaceAllRequired(code,
        '<span>PTS</span><span>REB</span><span>AST</span><span>TO</span>',
        '<span>PTS</span><span>REB</span><span>AST</span><span>TO</span><span>STL+BLK</span>'
      );
      code=replaceAllRequired(code,
        '<span>{line.pts}</span><span>{line.reb}</span><span>{line.ast}</span><span>{line.turnovers}</span>',
        '<span>{line.pts}</span><span>{line.reb}</span><span>{line.ast}</span><span>{line.turnovers}</span><span>{line.stocks===undefined&&line.stl===undefined&&line.blk===undefined?"—":defensiveTotal(line)}</span>'
      );

      code=replaceAllRequired(code,
        "playerId:player.id,gp:0,wins:0,pts:0,reb:0,ast:0,turnovers:0,included:false",
        "playerId:player.id,gp:0,wins:0,pts:0,reb:0,ast:0,turnovers:0,stocks:0,included:false"
      );
      code=replaceRequired(code,
        "if([line.pts,line.reb,line.ast,line.turnovers].some(value=>value>500))",
        "if([line.pts,line.reb,line.ast,line.turnovers,defensiveTotal(line)].some(value=>value>500))"
      );
      code=replaceRequired(code,
        "turnovers:Math.max(0,player.turnovers-(oldLine?.turnovers??0)+(newLine?.turnovers??0)),",
        "turnovers:Math.max(0,player.turnovers-(oldLine?.turnovers??0)+(newLine?.turnovers??0)),\n        stocks:Math.max(0,defensiveTotal(player)-(oldLine?defensiveTotal(oldLine):0)+(newLine?defensiveTotal(newLine):0)),\n        defensiveGp:Math.max(0,(player.defensiveGp??0)-(oldLine&&(oldLine.stocks!==undefined||oldLine.stl!==undefined||oldLine.blk!==undefined)?oldLine.gp:0)+(newLine&&(newLine.stocks!==undefined||newLine.stl!==undefined||newLine.blk!==undefined)?newLine.gp:0)),"
      );
      code=replaceRequired(code,
        '<b>AST</b><b>TO</b></div>',
        '<b>AST</b><b>TO</b><b>STL+BLK</b></div>'
      );
      code=replaceRequired(code,
        '(["gp","wins","pts","reb","ast","turnovers"] as const)',
        '(["gp","wins","pts","reb","ast","turnovers","stocks"] as const)'
      );
      code=replaceRequired(code,
        '<span>TO {before.turnovers} → <strong>{after.turnovers}</strong></span><span>OVR',
        '<span>TO {before.turnovers} → <strong>{after.turnovers}</strong></span><span>STL+BLK {defensiveTotal(before)} → <strong>{defensiveTotal(after)}</strong></span><span>OVR'
      );

      code=replaceRequired(code,
        '{playerId:players[0]?.id??"",team:draft.teamA,pts:0,reb:0,ast:0,turnovers:0}',
        '{playerId:players[0]?.id??"",team:draft.teamA,pts:0,reb:0,ast:0,turnovers:0,stocks:0}'
      );
      code=replaceRequired(code,
        '(["pts","reb","ast","turnovers"] as const).map(key=><label key={key}>{key==="turnovers"?"TO":key.toUpperCase()}<input type="number" min="0" value={line[key]}',
        '(["pts","reb","ast","turnovers","stocks"] as const).map(key=><label key={key}>{key==="turnovers"?"TO":key==="stocks"?"STL+BLK":key.toUpperCase()}<input type="number" min="0" value={line[key]??0}'
      );

      code=replaceRequired(code,
        'wins:0,losses:0,pts:0,reb:0,ast:0,turnovers:0,awards:[]',
        'wins:0,losses:0,pts:0,reb:0,ast:0,turnovers:0,stocks:0,defensiveGp:0,awards:[]'
      );
      code=replaceRequired(code,
        'keyof Pick<Player,"wins"|"losses"|"pts"|"reb"|"ast"|"turnovers">',
        'keyof Pick<Player,"wins"|"losses"|"pts"|"reb"|"ast"|"turnovers"|"stocks"|"defensiveGp">'
      );
      code=replaceRequired(code,
        'value={draft[label]}',
        'value={draft[label]??0}'
      );
      code=replaceRequired(code,
        ')=><label>{label[0].toUpperCase()+label.slice(1)}<input',
        ')=><label>{label==="stocks"?"Steals + Blocks":label[0].toUpperCase()+label.slice(1)}<input'
      );
      code=replaceRequired(code,
        '{numberField("wins")}{numberField("losses")}{numberField("pts")}{numberField("reb")}{numberField("ast")}{numberField("turnovers")}',
        '{numberField("wins")}{numberField("losses")}{numberField("pts")}{numberField("reb")}{numberField("ast")}{numberField("turnovers")}{numberField("stocks")}<label>STL+BLK games tracked<input min="0" type="number" value={draft.defensiveGp??0} onChange={e=>setDraft({...draft,defensiveGp:Number(e.target.value)})}/><small>Used only for an accurate STL+BLK per-game average.</small></label>'
      );

      code=replaceRequired(code,
        'type SortKey="overall"|"gp"|"wins"|"losses"|"winPct"|"pts"|"reb"|"ast"|"turnovers"|"ppg"|"rpg"|"apg"|"topg"|"weeklyMvp"|"hall";',
        'type SortKey="overall"|"gp"|"wins"|"losses"|"winPct"|"pts"|"reb"|"ast"|"turnovers"|"stocks"|"ppg"|"rpg"|"apg"|"topg"|"stockspg"|"weeklyMvp"|"hall";'
      );
      code=replaceRequired(code,
        'pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers,ppg:avg(player.pts,player),rpg:avg(player.reb,player),apg:avg(player.ast,player),topg:avg(player.turnovers,player),weeklyMvp:',
        'pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers,stocks:defensiveTotal(player),ppg:avg(player.pts,player),rpg:avg(player.reb,player),apg:avg(player.ast,player),topg:avg(player.turnovers,player),stockspg:defensiveAvg(player,player),weeklyMvp:'
      );
      code=replaceRequired(code,
        '{head("pts","PTS")}{head("reb","REB")}{head("ast","AST")}{head("turnovers","TO")}</>:<>{head("ppg","PPG")}{head("rpg","RPG")}{head("apg","APG")}{head("topg","TOPG")}',
        '{head("pts","PTS")}{head("reb","REB")}{head("ast","AST")}{head("turnovers","TO")}{head("stocks","STL+BLK")}</>:<>{head("ppg","PPG")}{head("rpg","RPG")}{head("apg","APG")}{head("topg","TOPG")}{head("stockspg","STL+BLK/G")}'
      );
      code=replaceRequired(code,
        '<span>{player.pts}</span><span>{player.reb}</span><span>{player.ast}</span><span>{player.turnovers}</span></>:<><span>{avg(player.pts,player)}</span><span>{avg(player.reb,player)}</span><span>{avg(player.ast,player)}</span><span>{avg(player.turnovers,player)}</span>',
        '<span>{player.pts}</span><span>{player.reb}</span><span>{player.ast}</span><span>{player.turnovers}</span><span>{defensiveTotal(player)}</span></>:<><span>{avg(player.pts,player)}</span><span>{avg(player.reb,player)}</span><span>{avg(player.ast,player)}</span><span>{avg(player.turnovers,player)}</span><span>{defensiveAvg(player,player)}</span>'
      );
      code=replaceRequired(code,
        'subtitle="Every published Sunday updates this table automatically. Tap any heading to rank the league.">',
        'subtitle="Every published Sunday updates this table automatically. STL+BLK is one combined category tracked from the first recorded week.">'
      );

      code=replaceRequired(code,
        'const assistsLeader=[...players].sort((a,b)=>b.ast-a.ast)[0];\n  const winLeader=',
        'const assistsLeader=[...players].sort((a,b)=>b.ast-a.ast)[0];\n  const defensiveEligible=players.filter(player=>(player.defensiveGp??0)>0);\n  const stocksLeader=[...defensiveEligible].sort((a,b)=>defensiveTotal(b)-defensiveTotal(a))[0];\n  const winLeader='
      );
      code=replaceRequired(code,
        '{category:"Career",label:"Most Assists",holder:assistsLeader?.name??"—",value:String(assistsLeader?.ast??0),date:"Live shared totals"},',
        '{category:"Career",label:"Most Steals + Blocks",holder:stocksLeader?.name??"—",value:stocksLeader?String(defensiveTotal(stocksLeader)):"—",date:"Tracked as one combined category"},'
      );
      code=replaceRequired(code,
        '[players,finalGames,pointsLeader,reboundsLeader,assistsLeader,winLeader]);',
        '[players,finalGames,pointsLeader,reboundsLeader,assistsLeader,stocksLeader,winLeader]);'
      );

      code=replaceRequired(code,
        'turnovers:read([/(?:turnovers?|tos?|to)\\s*[:=-]?\\s*(\\d+)/i,/(\\d+)\\s*(?:turnovers?|tos?)/i]),included:true,uncertain:false}',
        'turnovers:read([/(?:turnovers?|tos?|to)\\s*[:=-]?\\s*(\\d+)/i,/(\\d+)\\s*(?:turnovers?|tos?)/i]),stocks:read([/(?:stocks?|stl\\s*\\+\\s*blk|steals?\\s*\\+\\s*blocks?)\\s*[:=-]?\\s*(\\d+)/i,/(\\d+)\\s*(?:stocks?|stl\\s*\\+\\s*blk|steals?\\s*\\+\\s*blocks?)/i])||read([/(?:steals?|stl)\\s*[:=-]?\\s*(\\d+)/i,/(\\d+)\\s*(?:steals?|stl)/i])+read([/(?:blocks?|blk)\\s*[:=-]?\\s*(\\d+)/i,/(\\d+)\\s*(?:blocks?|blk)/i]),included:true,uncertain:false}'
      );
      code=replaceAllRequired(code,
        '15 rebounds, 8 assists, 2 turnovers.',
        '15 rebounds, 8 assists, 2 turnovers, 4 steals + blocks.'
      );
      code=replaceAllRequired(code,
        'five assists, one turnover.”',
        'five assists, one turnover, four steals + blocks.”'
      );
      code=replaceRequired(code,
        '<div className="cardTotals"><span><b>{player.pts}</b>PTS</span><span><b>{player.reb}</b>REB</span><span><b>{player.ast}</b>AST</span><span><b>{player.wins}</b>WINS</span></div>',
        '<div className="cardTotals"><span><b>{player.pts}</b>PTS</span><span><b>{player.reb}</b>REB</span><span><b>{player.ast}</b>AST</span><span><b>{defensiveTotal(player)}</b>STL+BLK</span><span><b>{player.wins}</b>WINS</span></div>'
      );
      code=replaceRequired(code,
        'return {player,logs:logs.length,points:high("pts"),rebounds:high("reb"),assists:high("ast"),streak};',
        'return {player,logs:logs.length,points:high("pts"),rebounds:high("reb"),assists:high("ast"),stocks:logs.length?Math.max(...logs.map(log=>defensiveTotal(log.line))):0,streak};'
      );
      code=replaceRequired(code,
        '<div className="analyticsHead"><b>Player</b><span>GP</span><span>PTS High</span><span>REB High</span><span>AST High</span><span>Win Streak</span></div>',
        '<div className="analyticsHead"><b>Player</b><span>GP</span><span>PTS High</span><span>REB High</span><span>AST High</span><span>STL+BLK High</span><span>Win Streak</span></div>'
      );
      code=replaceRequired(code,
        '<strong>{row.points||"—"}</strong><strong>{row.rebounds||"—"}</strong><strong>{row.assists||"—"}</strong><span>{row.streak?`${row.streak} W`:"—"}</span>',
        '<strong>{row.points||"—"}</strong><strong>{row.rebounds||"—"}</strong><strong>{row.assists||"—"}</strong><strong>{row.stocks||"—"}</strong><span>{row.streak?`${row.streak} W`:"—"}</span>'
      );
      code=replaceRequired(code,
        '<small>{p.position} · {p.wins}-{p.losses} · {p.pts} PTS</small>',
        '<small>{p.position} · {p.wins}-{p.losses} · {p.pts} PTS · {defensiveTotal(p)} STL+BLK</small>'
      );
      code=replaceRequired(code,
        'onClick={()=>setDraft({...p,awards:[...p.awards],overallOverride:undefined})}',
        'onClick={()=>setDraft({...p,stocks:defensiveTotal(p),awards:[...p.awards],overallOverride:undefined})}'
      );

      code=replaceAllRequired(code,"repeat(4,62px)","repeat(5,62px)");
      code=replaceAllRequired(code,"repeat(4,58px)","repeat(5,58px)");
      code=replaceAllRequired(code,"repeat(4,55px)","repeat(5,55px)");
      code=replaceAllRequired(code,"repeat(4,42px)","repeat(5,42px)");
      code=replaceAllRequired(code,"repeat(4,20px)","repeat(5,20px)");
      code=replaceRequired(code,"repeat(6,70px)","repeat(7,70px)");
      code=replaceRequired(code,".playerChangePreview{display:grid;grid-template-columns:minmax(100px,1fr) repeat(6,auto)",".playerChangePreview{display:grid;grid-template-columns:minmax(100px,1fr) repeat(7,auto)");
      code=replaceRequired(code,"min-width:1050px","min-width:1120px");
      code=replaceRequired(code,".profileGameLog{margin-top:18px}",".profileGameLog{margin-top:18px;overflow:auto}");
      code=replaceRequired(code,".miniStats{display:grid;grid-template-columns:repeat(3,1fr)",".miniStats{display:grid;grid-template-columns:repeat(4,1fr)");
      code=replaceRequired(code,".analyticsHead,.analyticsRow{min-width:700px;display:grid;grid-template-columns:minmax(150px,1fr) repeat(5,90px)",".analyticsHead,.analyticsRow{min-width:790px;display:grid;grid-template-columns:minmax(150px,1fr) repeat(6,90px)");

      return {code,map:null};
    }
  };
}
