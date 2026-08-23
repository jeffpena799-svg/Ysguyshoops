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
        "wins: number; losses: number; pts: number; reb: number; ast: number; turnovers: number; stl?:number; blk?:number; defensiveGp?:number;"
      );
      code=replaceRequired(code,
        "type StatLine = { playerId:string; team:string; pts:number; reb:number; ast:number; turnovers:number };",
        "type StatLine = { playerId:string; team:string; pts:number; reb:number; ast:number; turnovers:number; stl?:number; blk?:number };"
      );
      code=replaceRequired(code,
        "playerId:string; gp:number; wins:number; pts:number; reb:number; ast:number; turnovers:number;",
        "playerId:string; gp:number; wins:number; pts:number; reb:number; ast:number; turnovers:number; stl?:number; blk?:number;"
      );
      code=replaceRequired(code,
        "type PlayerStatBaseline = Record<string,{wins:number;losses:number;pts:number;reb:number;ast:number;turnovers:number}>;",
        "type PlayerStatBaseline = Record<string,{wins:number;losses:number;pts:number;reb:number;ast:number;turnovers:number;stl?:number;blk?:number;defensiveGp?:number}>;"
      );

      code=replaceRequired(code,
        "function avg(v:number,p:Player){ return gp(p) ? Math.round((v/gp(p))*10)/10 : 0; }",
        "function avg(v:number,p:Player){ return gp(p) ? Math.round((v/gp(p))*10)/10 : 0; }\nfunction defensiveAvg(v:number|undefined,p:Player){ return p.defensiveGp ? Math.round(((v??0)/p.defensiveGp)*10)/10 : 0; }"
      );
      code=replaceRequired(code,
        "return Object.fromEntries(players.map(player=>[player.id,{wins:player.wins,losses:player.losses,pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers}]));",
        "return Object.fromEntries(players.map(player=>[player.id,{wins:player.wins,losses:player.losses,pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers,stl:player.stl??0,blk:player.blk??0,defensiveGp:player.defensiveGp??0}]));"
      );
      code=replaceRequired(code,
        "const base=baseline[player.id]??{wins:player.wins,losses:player.losses,pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers};",
        "const base=baseline[player.id]??{wins:player.wins,losses:player.losses,pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers,stl:player.stl??0,blk:player.blk??0,defensiveGp:player.defensiveGp??0};"
      );
      code=replaceRequired(code,
        "turnovers:base.turnovers+lines.reduce((sum,line)=>sum+line.turnovers,0),",
        "turnovers:base.turnovers+lines.reduce((sum,line)=>sum+line.turnovers,0),\n      stl:(base.stl??0)+lines.reduce((sum,line)=>sum+(line.stl??0),0),\n      blk:(base.blk??0)+lines.reduce((sum,line)=>sum+(line.blk??0),0),\n      defensiveGp:(base.defensiveGp??0)+lines.reduce((sum,line)=>sum+(line.stl!==undefined||line.blk!==undefined?line.gp:0),0),"
      );
      code=replaceRequired(code,
        "pts:Math.max(0,player.pts+line.pts*multiplier),reb:Math.max(0,player.reb+line.reb*multiplier),ast:Math.max(0,player.ast+line.ast*multiplier),turnovers:Math.max(0,player.turnovers+line.turnovers*multiplier),",
        "pts:Math.max(0,player.pts+line.pts*multiplier),reb:Math.max(0,player.reb+line.reb*multiplier),ast:Math.max(0,player.ast+line.ast*multiplier),turnovers:Math.max(0,player.turnovers+line.turnovers*multiplier),stl:Math.max(0,(player.stl??0)+(line.stl??0)*multiplier),blk:Math.max(0,(player.blk??0)+(line.blk??0)*multiplier),defensiveGp:Math.max(0,(player.defensiveGp??0)+((line.stl!==undefined||line.blk!==undefined)?multiplier:0)),"
      );

      code=replaceRequired(code,
        'const [leaderKey,setLeaderKey]=useState<"pts"|"reb"|"ast"|"wins">("pts");',
        'const [leaderKey,setLeaderKey]=useState<"pts"|"reb"|"ast"|"stl"|"blk"|"wins">("pts");'
      );
      code=replaceRequired(code,
        "const ranked=useMemo(()=>[...players].sort((a,b)=>b[leaderKey]-a[leaderKey]),[leaderKey]);",
        "const ranked=useMemo(()=>[...players].sort((a,b)=>(b[leaderKey]??0)-(a[leaderKey]??0)),[players,leaderKey]);"
      );
      code=replaceRequired(code,
        "([['pts','PTS'],['reb','REB'],['ast','AST'],['wins','WINS']] as const)",
        "([['pts','PTS'],['reb','REB'],['ast','AST'],['stl','STL'],['blk','BLK'],['wins','WINS']] as const)"
      );

      code=replaceRequired(code,
        '<div className="profileTags"><b>#{rank} OVERALL</b><b>{player.wins}-{player.losses} RECORD</b><b>{pct(player)}% WIN</b>',
        '<div className="profileTags"><b>#{rank} OVERALL</b><b>{player.wins}-{player.losses} RECORD</b><b>{pct(player)}% WIN</b><b>{player.stl??0} STL</b><b>{player.blk??0} BLK</b>'
      );
      code=replaceRequired(code,
        '["APG",avg(left.ast,left),avg(right.ast,right)],',
        '["APG",avg(left.ast,left),avg(right.ast,right)],\n    ["SPG",defensiveAvg(left.stl,left),defensiveAvg(right.stl,right)],\n    ["BPG",defensiveAvg(left.blk,left),defensiveAvg(right.blk,right)],'
      );

      code=replaceAllRequired(code,
        '<span>PTS</span><span>REB</span><span>AST</span><span>TO</span>',
        '<span>PTS</span><span>REB</span><span>AST</span><span>TO</span><span>STL</span><span>BLK</span>'
      );
      code=replaceAllRequired(code,
        '<span>{line.pts}</span><span>{line.reb}</span><span>{line.ast}</span><span>{line.turnovers}</span>',
        '<span>{line.pts}</span><span>{line.reb}</span><span>{line.ast}</span><span>{line.turnovers}</span><span>{line.stl??"—"}</span><span>{line.blk??"—"}</span>'
      );

      code=replaceAllRequired(code,
        "playerId:player.id,gp:0,wins:0,pts:0,reb:0,ast:0,turnovers:0,included:false",
        "playerId:player.id,gp:0,wins:0,pts:0,reb:0,ast:0,turnovers:0,stl:0,blk:0,included:false"
      );
      code=replaceRequired(code,
        "if([line.pts,line.reb,line.ast,line.turnovers].some(value=>value>500))",
        "if([line.pts,line.reb,line.ast,line.turnovers,line.stl??0,line.blk??0].some(value=>value>500))"
      );
      code=replaceRequired(code,
        "turnovers:Math.max(0,player.turnovers-(oldLine?.turnovers??0)+(newLine?.turnovers??0)),",
        "turnovers:Math.max(0,player.turnovers-(oldLine?.turnovers??0)+(newLine?.turnovers??0)),\n        stl:Math.max(0,(player.stl??0)-(oldLine?.stl??0)+(newLine?.stl??0)),\n        blk:Math.max(0,(player.blk??0)-(oldLine?.blk??0)+(newLine?.blk??0)),\n        defensiveGp:Math.max(0,(player.defensiveGp??0)-(oldLine&&(oldLine.stl!==undefined||oldLine.blk!==undefined)?oldLine.gp:0)+(newLine&&(newLine.stl!==undefined||newLine.blk!==undefined)?newLine.gp:0)),"
      );
      code=replaceRequired(code,
        '<b>AST</b><b>TO</b></div>',
        '<b>AST</b><b>TO</b><b>STL</b><b>BLK</b></div>'
      );
      code=replaceRequired(code,
        '(["gp","wins","pts","reb","ast","turnovers"] as const)',
        '(["gp","wins","pts","reb","ast","turnovers","stl","blk"] as const)'
      );
      code=replaceRequired(code,
        '<span>TO {before.turnovers} → <strong>{after.turnovers}</strong></span><span>OVR',
        '<span>TO {before.turnovers} → <strong>{after.turnovers}</strong></span><span>STL {before.stl??0} → <strong>{after.stl??0}</strong></span><span>BLK {before.blk??0} → <strong>{after.blk??0}</strong></span><span>OVR'
      );

      code=replaceRequired(code,
        '{playerId:players[0]?.id??"",team:draft.teamA,pts:0,reb:0,ast:0,turnovers:0}',
        '{playerId:players[0]?.id??"",team:draft.teamA,pts:0,reb:0,ast:0,turnovers:0,stl:0,blk:0}'
      );
      code=replaceRequired(code,
        '(["pts","reb","ast","turnovers"] as const).map(key=><label key={key}>{key==="turnovers"?"TO":key.toUpperCase()}<input type="number" min="0" value={line[key]}',
        '(["pts","reb","ast","turnovers","stl","blk"] as const).map(key=><label key={key}>{key==="turnovers"?"TO":key.toUpperCase()}<input type="number" min="0" value={line[key]??0}'
      );

      code=replaceRequired(code,
        'wins:0,losses:0,pts:0,reb:0,ast:0,turnovers:0,awards:[]',
        'wins:0,losses:0,pts:0,reb:0,ast:0,turnovers:0,stl:0,blk:0,defensiveGp:0,awards:[]'
      );
      code=replaceRequired(code,
        'keyof Pick<Player,"wins"|"losses"|"pts"|"reb"|"ast"|"turnovers">',
        'keyof Pick<Player,"wins"|"losses"|"pts"|"reb"|"ast"|"turnovers"|"stl"|"blk"|"defensiveGp">'
      );
      code=replaceRequired(code,
        'value={draft[label]}',
        'value={draft[label]??0}'
      );
      code=replaceRequired(code,
        ')=><label>{label[0].toUpperCase()+label.slice(1)}<input',
        ')=><label>{label==="stl"?"Steals":label==="blk"?"Blocks":label[0].toUpperCase()+label.slice(1)}<input'
      );
      code=replaceRequired(code,
        '{numberField("wins")}{numberField("losses")}{numberField("pts")}{numberField("reb")}{numberField("ast")}{numberField("turnovers")}',
        '{numberField("wins")}{numberField("losses")}{numberField("pts")}{numberField("reb")}{numberField("ast")}{numberField("turnovers")}{numberField("stl")}{numberField("blk")}<label>Defensive-stat games tracked<input min="0" type="number" value={draft.defensiveGp??0} onChange={e=>setDraft({...draft,defensiveGp:Number(e.target.value)})}/><small>Used only for accurate SPG and BPG.</small></label>'
      );

      code=replaceRequired(code,
        'type SortKey="overall"|"gp"|"wins"|"losses"|"winPct"|"pts"|"reb"|"ast"|"turnovers"|"ppg"|"rpg"|"apg"|"topg"|"weeklyMvp"|"hall";',
        'type SortKey="overall"|"gp"|"wins"|"losses"|"winPct"|"pts"|"reb"|"ast"|"turnovers"|"stl"|"blk"|"ppg"|"rpg"|"apg"|"topg"|"spg"|"bpg"|"weeklyMvp"|"hall";'
      );
      code=replaceRequired(code,
        'pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers,ppg:avg(player.pts,player),rpg:avg(player.reb,player),apg:avg(player.ast,player),topg:avg(player.turnovers,player),weeklyMvp:',
        'pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers,stl:player.stl??0,blk:player.blk??0,ppg:avg(player.pts,player),rpg:avg(player.reb,player),apg:avg(player.ast,player),topg:avg(player.turnovers,player),spg:defensiveAvg(player.stl,player),bpg:defensiveAvg(player.blk,player),weeklyMvp:'
      );
      code=replaceRequired(code,
        '{head("pts","PTS")}{head("reb","REB")}{head("ast","AST")}{head("turnovers","TO")}</>:<>{head("ppg","PPG")}{head("rpg","RPG")}{head("apg","APG")}{head("topg","TOPG")}',
        '{head("pts","PTS")}{head("reb","REB")}{head("ast","AST")}{head("turnovers","TO")}{head("stl","STL")}{head("blk","BLK")}</>:<>{head("ppg","PPG")}{head("rpg","RPG")}{head("apg","APG")}{head("topg","TOPG")}{head("spg","SPG")}{head("bpg","BPG")}'
      );
      code=replaceRequired(code,
        '<span>{player.pts}</span><span>{player.reb}</span><span>{player.ast}</span><span>{player.turnovers}</span></>:<><span>{avg(player.pts,player)}</span><span>{avg(player.reb,player)}</span><span>{avg(player.ast,player)}</span><span>{avg(player.turnovers,player)}</span>',
        '<span>{player.pts}</span><span>{player.reb}</span><span>{player.ast}</span><span>{player.turnovers}</span><span>{player.stl??0}</span><span>{player.blk??0}</span></>:<><span>{avg(player.pts,player)}</span><span>{avg(player.reb,player)}</span><span>{avg(player.ast,player)}</span><span>{avg(player.turnovers,player)}</span><span>{defensiveAvg(player.stl,player)}</span><span>{defensiveAvg(player.blk,player)}</span>'
      );
      code=replaceRequired(code,
        'subtitle="Every published Sunday updates this table automatically. Tap any heading to rank the league.">',
        'subtitle="Every published Sunday updates this table automatically. Steals and blocks begin with the first tracked week; earlier games are not counted.">'
      );

      code=replaceRequired(code,
        'const assistsLeader=[...players].sort((a,b)=>b.ast-a.ast)[0];\n  const winLeader=',
        'const assistsLeader=[...players].sort((a,b)=>b.ast-a.ast)[0];\n  const defensiveEligible=players.filter(player=>(player.defensiveGp??0)>0);\n  const stealsLeader=[...defensiveEligible].sort((a,b)=>(b.stl??0)-(a.stl??0))[0];\n  const blocksLeader=[...defensiveEligible].sort((a,b)=>(b.blk??0)-(a.blk??0))[0];\n  const winLeader='
      );
      code=replaceRequired(code,
        '{category:"Career",label:"Most Assists",holder:assistsLeader?.name??"—",value:String(assistsLeader?.ast??0),date:"Live shared totals"},',
        '{category:"Career",label:"Most Assists",holder:assistsLeader?.name??"—",value:String(assistsLeader?.ast??0),date:"Live shared totals"},\n    {category:"Career",label:"Most Steals",holder:stealsLeader?.name??"—",value:stealsLeader?String(stealsLeader.stl??0):"—",date:"Tracked from the first defensive-stat week"},\n    {category:"Career",label:"Most Blocks",holder:blocksLeader?.name??"—",value:blocksLeader?String(blocksLeader.blk??0):"—",date:"Tracked from the first defensive-stat week"},'
      );
      code=replaceRequired(code,
        '[players,finalGames,pointsLeader,reboundsLeader,assistsLeader,winLeader]);',
        '[players,finalGames,pointsLeader,reboundsLeader,assistsLeader,stealsLeader,blocksLeader,winLeader]);'
      );

      code=replaceRequired(code,
        'turnovers:read([/(?:turnovers?|tos?|to)\\s*[:=-]?\\s*(\\d+)/i,/(\\d+)\\s*(?:turnovers?|tos?)/i]),included:true,uncertain:false}',
        'turnovers:read([/(?:turnovers?|tos?|to)\\s*[:=-]?\\s*(\\d+)/i,/(\\d+)\\s*(?:turnovers?|tos?)/i]),stl:read([/(?:steals?|stl)\\s*[:=-]?\\s*(\\d+)/i,/(\\d+)\\s*(?:steals?|stl)/i]),blk:read([/(?:blocks?|blk)\\s*[:=-]?\\s*(\\d+)/i,/(\\d+)\\s*(?:blocks?|blk)/i]),included:true,uncertain:false}'
      );
      code=replaceAllRequired(code,
        '15 rebounds, 8 assists, 2 turnovers.',
        '15 rebounds, 8 assists, 2 turnovers, 3 steals, 1 block.'
      );
      code=replaceAllRequired(code,
        'five assists, one turnover.”',
        'five assists, one turnover, three steals, one block.”'
      );

      code=replaceAllRequired(code,"repeat(4,62px)","repeat(6,62px)");
      code=replaceAllRequired(code,"repeat(4,58px)","repeat(6,58px)");
      code=replaceAllRequired(code,"repeat(4,55px)","repeat(6,55px)");
      code=replaceAllRequired(code,"repeat(4,42px)","repeat(6,42px)");
      code=replaceAllRequired(code,"repeat(4,20px)","repeat(6,20px)");
      code=replaceRequired(code,"repeat(6,70px)","repeat(8,70px)");
      code=replaceRequired(code,".playerChangePreview{display:grid;grid-template-columns:minmax(100px,1fr) repeat(6,auto)",".playerChangePreview{display:grid;grid-template-columns:minmax(100px,1fr) repeat(8,auto)");
      code=replaceRequired(code,"min-width:1050px","min-width:1180px");
      code=replaceRequired(code,".profileGameLog{margin-top:18px}",".profileGameLog{margin-top:18px;overflow:auto}");

      return {code,map:null};
    }
  };
}
