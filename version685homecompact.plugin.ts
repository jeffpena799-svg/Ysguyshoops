import type { Plugin } from "vite";

function required(source:string,search:string,replacement:string){
  if(!source.includes(search))throw new Error(`Compact Home patch could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

export function version685HomeCompact():Plugin{
  return {
    name:"ys-guys-version-685-home-compact",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/components/HomeDashboard.tsx"))return null;
      let code=source;

      code=required(code,
        '  const confirmed=useMemo(()=>nextRun?.rsvps?.filter(item=>item.status==="going")??[],[nextRun]);\n  const responded=nextRun?.rsvps?.length??0;\n  const confirmedPlayers=confirmed\n    .map(item=>players.find(player=>player.id===item.playerId))\n    .filter(Boolean) as PlayerLike[];',
        `  const confirmed=useMemo(()=>nextRun?.rsvps?.filter(item=>item.status==="going")??[],[nextRun]);
  const maybe=useMemo(()=>nextRun?.rsvps?.filter(item=>item.status==="maybe")??[],[nextRun]);
  const out=useMemo(()=>nextRun?.rsvps?.filter(item=>item.status==="out")??[],[nextRun]);
  const responded=nextRun?.rsvps?.length??0;
  const confirmedPlayers=confirmed
    .map(item=>players.find(player=>player.id===item.playerId))
    .filter(Boolean) as PlayerLike[];
  const maybePlayers=maybe.map(item=>players.find(player=>player.id===item.playerId)).filter(Boolean) as PlayerLike[];
  const outPlayers=out.map(item=>players.find(player=>player.id===item.playerId)).filter(Boolean) as PlayerLike[];`
      );

      code=required(code,
        '          <small className="homeResponse">{message||`${Math.max(0,players.length-responded)} players have not responded`}</small>',
        `          <div className="homeRsvpLists">
            <div className="maybe"><b>? MAYBE {maybe.length}</b><span>{maybePlayers.length?maybePlayers.map(player=>player.name).join(" · "):"None"}</span></div>
            <div className="out"><b>× OUT {out.length}</b><span>{outPlayers.length?outPlayers.map(player=>player.name).join(" · "):"None"}</span></div>
          </div>
          <small className="homeResponse">{message||\`${'${Math.max(0,players.length-responded)}'} players have not responded\`}</small>`
      );

      code=required(code,
        'const css=`',
        `const css=\`
.homeRsvpLists{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}
.homeRsvpLists>div{min-width:0;padding:8px 10px;border:1px solid rgba(255,255,255,.12);border-radius:9px;background:rgba(255,255,255,.045);display:grid;gap:3px}
.homeRsvpLists b{font-size:9px;letter-spacing:.08em}
.homeRsvpLists span{font-size:10px;color:#d2dbe7;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.homeRsvpLists .maybe b{color:#efb638}.homeRsvpLists .out b{color:#ff6e77}
@media(max-width:640px){
  .homeClean67{gap:8px}
  .homeCleanHeader{display:none!important}
  .homeCleanMain{display:grid!important;grid-template-columns:1fr!important;gap:9px!important}
  .homeSunday,.homeNews,.homePlayer{grid-column:1!important;border-radius:16px!important}
  .homeSunday{min-height:0!important;padding:14px!important}
  .homeSundayTop>span{padding:5px 9px!important;font-size:10px!important}
  .homeSundayTop strong{font-size:23px!important}
  .homeSunday h2{font-size:31px!important;line-height:.94!important;margin:10px 0 7px!important}
  .homeMeta{gap:7px 14px!important;font-size:12px!important}
  .homeNote{display:none!important}
  .homeFaces{margin:10px 0 8px!important}
  .homeFaces img,.homeFaces span,.homeFaces i{width:30px!important;height:30px!important;font-size:8px!important}
  .homeFaces i{margin-left:10px!important}
  .homeRsvp{gap:6px!important;margin-top:8px!important}
  .homeRsvp button{min-height:45px!important;font-size:12px!important;border-radius:9px!important;padding:5px!important}
  .homeRsvpLists{gap:5px!important;margin-top:7px!important}
  .homeRsvpLists>div{padding:5px 7px!important}
  .homeRsvpLists b{font-size:8px!important}.homeRsvpLists span{font-size:9px!important}
  .homeResponse{font-size:9px!important;margin-top:6px!important}
  .homeNews{min-height:0!important;padding:11px!important}
  .homeSectionTitle{font-size:11px!important}
  .homeFeature{min-height:125px!important;margin-top:8px!important;padding:12px!important;border-radius:11px!important}
  .homeFeature>span{padding:4px 7px!important;font-size:8px!important}
  .homeFeature h2{font-size:20px!important;margin:7px 0 0!important;line-height:.95!important}
  .homeFeature p{display:none!important}
  .homeNewsLinks{display:none!important}
  .homePlayer{padding:11px!important}
  .homePlayer .homeSectionTitle{margin-bottom:6px!important}
  .homePlayerInner{padding:8px!important;min-height:0!important}
  .homePlayerInner img,.homePlayerInner>div:first-child{width:46px!important;height:46px!important}
  .homePlayerInner section strong{font-size:25px!important}
  .homePlayerInner section h3{font-size:15px!important;margin:0!important}
  .homePlayerStats{gap:4px!important}
  .homePlayerStats span{font-size:7px!important}.homePlayerStats b{font-size:13px!important}
  .homePlayerInner>i{font-size:9px!important}
}
`
      );

      return {code,map:null};
    }
  };
}
