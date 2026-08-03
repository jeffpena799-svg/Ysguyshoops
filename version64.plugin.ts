import type { Plugin } from "vite";

function replaceRequired(source:string,search:string,replacement:string){
  if(!source.includes(search))throw new Error(`Version 6.4 patch could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

export function version64Feature():Plugin{
  return {
    name:"ys-guys-version-6-4",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      let code=source;

      code=replaceRequired(code,
        'type View = "home" | "attendance" | "community" | "games" | "players" | "profile" | "compare" | "leaders" | "more" | "records" | "awards" | "seasons" | "calendar" | "rules" | "hof" | "timeline" | "voting" | "studio" | "commissioner";',
        'type View = "home" | "attendance" | "community" | "games" | "players" | "profile" | "compare" | "leaders" | "season-stats" | "more" | "records" | "awards" | "seasons" | "calendar" | "rules" | "hof" | "timeline" | "voting" | "studio" | "commissioner";'
      );

      code=replaceRequired(code,
        '      {view==="leaders" && <Page eyebrow="LEAGUE LEADERS" title="See who sets the pace." subtitle="Current totals through July 26, 2026.">',
        '      {view==="season-stats" && <SeasonStatsTable players={players} games={games} awards={awards} onOpen={openProfile}/>}\n\n      {view==="leaders" && <Page eyebrow="LEAGUE LEADERS" title="See who sets the pace." subtitle="Current totals through July 26, 2026.">'
      );

      code=replaceRequired(code,
        '{view==="more" && <Page eyebrow="LEAGUE UNIVERSE · v6.3.2" title="More from Y\'s Guys" subtitle="A cleaner home for league stories, ideas and history."><div className="menuList"><Menu label="Community News" icon="📰" onClick={()=>go("community")}/>',
        '{view==="more" && <Page eyebrow="LEAGUE UNIVERSE · v6.4" title="More from Y\'s Guys" subtitle="A cleaner home for league stories, ideas and history."><div className="menuList"><Menu label="Season Stats" icon="📊" onClick={()=>go("season-stats")}/><Menu label="Community News" icon="📰" onClick={()=>go("community")}/>'
      );

      code=replaceRequired(code,
        '<Nav label="Hall" icon="♛" active={view==="hof"} onClick={()=>go("hof")}/>',
        '<Nav label="Hall" icon="♛" active={["hof","season-stats"].includes(view)} onClick={()=>go("hof")}/>'
      );

      code=replaceRequired(code,
        'function AttendanceCenter({runs,players,defaultPlayerId,onSubmit}',
        `function SeasonStatsTable({players,games,awards,onOpen}:{players:Player[];games:Game[];awards:Award[];onOpen:(player:Player)=>void}){
  type SortKey="overall"|"gp"|"wins"|"losses"|"winPct"|"pts"|"reb"|"ast"|"turnovers"|"ppg"|"rpg"|"apg"|"topg"|"weeklyMvp"|"hall";
  const [sortKey,setSortKey]=useState<SortKey>("pts");
  const [direction,setDirection]=useState<"desc"|"asc">("desc");
  const [viewMode,setViewMode]=useState<"totals"|"averages">("totals");
  const [status,setStatus]=useState<"all"|"appeared">("all");
  const sort=(key:SortKey)=>{if(sortKey===key)setDirection(value=>value==="desc"?"asc":"desc");else{setSortKey(key);setDirection("desc")}};
  const value=(player:Player,key:SortKey)=>({overall:overallRating(player,players,games)??1,gp:gp(player),wins:player.wins,losses:player.losses,winPct:pct(player),pts:player.pts,reb:player.reb,ast:player.ast,turnovers:player.turnovers,ppg:avg(player.pts,player),rpg:avg(player.reb,player),apg:avg(player.ast,player),topg:avg(player.turnovers,player),weeklyMvp:weeklyMvpWins(player),hall:hallProgress(hallResume(player,awards).total)})[key];
  const visible=players.filter(player=>status==="all"||gp(player)>0).sort((a,b)=>{const delta=value(b,sortKey)-value(a,sortKey);return (direction==="desc"?delta:-delta)||a.name.localeCompare(b.name)});
  const head=(key:SortKey,label:string)=><button className={sortKey===key?"active":""} onClick={()=>sort(key)}>{label}{sortKey===key?(direction==="desc"?" ↓":" ↑"):""}</button>;
  return <Page eyebrow="SUMMER 2026 · LIVE TABLE" title="Season Stats" subtitle="Every published Sunday updates this table automatically. Tap any heading to rank the league.">
    <div className="seasonStatFilters"><div><button className={viewMode==="totals"?"active":""} onClick={()=>setViewMode("totals")}>Totals</button><button className={viewMode==="averages"?"active":""} onClick={()=>setViewMode("averages")}>Per game</button></div><div><button className={status==="all"?"active":""} onClick={()=>setStatus("all")}>All players</button><button className={status==="appeared"?"active":""} onClick={()=>setStatus("appeared")}>Played</button></div></div>
    <section className="seasonStatsTable"><div className="seasonStatsHead"><b>Player</b>{head("overall","OVR")}{head("gp","GP")}{head("wins","W")}{head("losses","L")}{head("winPct","WIN%")} {viewMode==="totals"?<>{head("pts","PTS")}{head("reb","REB")}{head("ast","AST")}{head("turnovers","TO")}</>:<>{head("ppg","PPG")}{head("rpg","RPG")}{head("apg","APG")}{head("topg","TOPG")}</>}{head("weeklyMvp","MVP")}{head("hall","HOF")}</div>{visible.map((player,index)=><button className="seasonStatsRow" onClick={()=>onOpen(player)} key={player.id}><b><span>{index+1}</span>{player.name}<small>{player.position}</small></b><strong>{overallRating(player,players,games)??1}</strong><span>{gp(player)}</span><span>{player.wins}</span><span>{player.losses}</span><span>{pct(player)}%</span>{viewMode==="totals"?<><span>{player.pts}</span><span>{player.reb}</span><span>{player.ast}</span><span>{player.turnovers}</span></>:<><span>{avg(player.pts,player)}</span><span>{avg(player.reb,player)}</span><span>{avg(player.ast,player)}</span><span>{avg(player.turnovers,player)}</span></>}<span>{weeklyMvpWins(player)}</span><span>{formatHallValue(hallProgress(hallResume(player,awards).total))}%</span></button>)}</section>
  </Page>;
}

function AttendanceCenter({runs,players,defaultPlayerId,onSubmit}`
      );

      code=replaceRequired(code,
        '  const [scanMessage,setScanMessage]=useState("");',
        '  const [scanMessage,setScanMessage]=useState("");\n  const [pastedStats,setPastedStats]=useState("");'
      );

      code=replaceRequired(code,
        '  const scan=async()=>{',
        `  const parsePastedStats=()=>{
    const normalize=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]/g,"");
    const rows=pastedStats.split(/\\n+/).map(value=>value.trim()).filter(Boolean);
    let matched=0;
    setLines(current=>players.map(player=>{
      const aliases=[player.name,player.nickname,player.id].filter(Boolean).map(normalize);
      const row=rows.find(value=>{const normalized=normalize(value);return aliases.some(alias=>alias.length>1&&normalized.startsWith(alias))});
      if(!row)return current.find(line=>line.playerId===player.id)??{playerId:player.id,gp:0,wins:0,pts:0,reb:0,ast:0,turnovers:0,included:false};
      const read=(patterns:RegExp[])=>{for(const pattern of patterns){const found=row.match(pattern);if(found)return Number(found[1])||0}return 0};
      const record=row.match(/(\\d+)\\s*[-–]\\s*(\\d+)/);const wins=record?Number(record[1]):read([/(?:wins?|w)\\s*[:=-]?\\s*(\\d+)/i]);const losses=record?Number(record[2]):read([/(?:losses?|l)\\s*[:=-]?\\s*(\\d+)/i]);
      const gpValue=read([/(?:games? played|gp)\\s*[:=-]?\\s*(\\d+)/i])||wins+losses;
      matched++;
      return {playerId:player.id,gp:gpValue,wins,pts:read([/(?:points?|pts)\\s*[:=-]?\\s*(\\d+)/i,/(\\d+)\\s*(?:points?|pts)/i]),reb:read([/(?:rebounds?|reb)\\s*[:=-]?\\s*(\\d+)/i,/(\\d+)\\s*(?:rebounds?|reb)/i]),ast:read([/(?:assists?|ast)\\s*[:=-]?\\s*(\\d+)/i,/(\\d+)\\s*(?:assists?|ast)/i]),turnovers:read([/(?:turnovers?|tos?|to)\\s*[:=-]?\\s*(\\d+)/i,/(\\d+)\\s*(?:turnovers?|tos?)/i]),included:true,uncertain:false};
    }));
    setScanMessage(matched?"Interpreted "+matched+" player rows. Review every value before publishing.":"No player names were matched. Try one player per line with labeled stats.");
  };
  const scan=async()=>{`
      );

      code=replaceRequired(code,
        '      <div className="scanBox"><label className="uploadButton">',
        '      <div className="aiStatAssistant"><small>AI STAT ASSISTANT</small><h3>Upload a sheet or paste the totals</h3><p>Use one player per line. Example: Dusko 5-4, 22 points, 15 rebounds, 8 assists, 2 turnovers.</p><textarea value={pastedStats} onChange={event=>setPastedStats(event.target.value)} placeholder="Paste or type this Sunday’s stats…"/><button type="button" className="secondary" disabled={!pastedStats.trim()} onClick={parsePastedStats}>Interpret pasted stats</button></div>\n      <div className="scanBox"><label className="uploadButton">'
      );

      code=replaceRequired(code,
        '.sessionManager{display:grid;gap:18px}',
        '.seasonStatFilters{display:flex;justify-content:space-between;gap:12px;margin-bottom:14px}.seasonStatFilters>div{display:flex;gap:7px}.seasonStatFilters button{border:1px solid #dce2ea;background:white;color:#0A2D5E;padding:10px 13px;border-radius:999px;font-weight:900}.seasonStatFilters button.active{background:#0A2D5E;color:white}.seasonStatsTable{background:white;border:1px solid #dfe4eb;border-radius:22px;overflow:auto}.seasonStatsHead,.seasonStatsRow{min-width:1050px;display:grid;grid-template-columns:minmax(150px,1.35fr) 58px 48px 48px 48px 68px repeat(4,58px) 58px 68px;align-items:center;gap:5px;padding:12px 15px;text-align:center}.seasonStatsHead{background:#0A2D5E;color:white}.seasonStatsHead button{border:0;background:none;color:white;font-size:10px;font-weight:1000}.seasonStatsHead button.active{color:#e7c977}.seasonStatsRow{width:100%;border:0;border-top:1px solid #edf0f4;background:white;color:#0A2D5E}.seasonStatsRow:hover{background:#f7f9fc}.seasonStatsRow>b{text-align:left;display:grid;grid-template-columns:25px 1fr;align-items:center}.seasonStatsRow>b span{grid-row:1/3;color:#9b7628}.seasonStatsRow>b small{grid-column:2;color:#7b8798}.seasonStatsRow strong{color:#9b7628;font-size:18px}.aiStatAssistant{margin:18px 0;padding:18px;border-radius:18px;background:linear-gradient(135deg,#eef4fb,#fff8e3);border:1px solid #d5dfeb}.aiStatAssistant>small{font-size:9px;letter-spacing:.14em;color:#987323;font-weight:1000}.aiStatAssistant h3{margin:5px 0}.aiStatAssistant p{color:#65748a;font-size:12px}.aiStatAssistant textarea{width:100%;min-height:120px;padding:12px;border:1px solid #ccd7e4;border-radius:12px;font:inherit;resize:vertical}.aiStatAssistant button{margin-top:10px}\n.sessionManager{display:grid;gap:18px}'
      );

      code=code.split('version:"6.3.2"').join('version:"6.4"');
      code=code.split('v6.3.2').join('v6.4');
      code=code.split('Version 6.3.2').join('Version 6.4');

      return {code,map:null};
    }
  };
}
