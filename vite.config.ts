import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { version632Feature } from "./version632.plugin";
import { version64Feature } from "./version64.plugin";
import { version65Feature } from "./version65.plugin";
import { version66Feature } from "./version66b.plugin";
import { version66NavigationFix } from "./version66navfix.plugin";
import { version66HomeComponent } from "./version66homecomponent.plugin";
import { version67MyPlayer } from "./version67myplayer.plugin";
import { version671Readability } from "./version671readability.plugin";
import { version673HomePolish } from "./version673homepolish.plugin";
import { version68AroundLeague } from "./version68aroundleague.plugin";
import { version681HallReadability } from "./version681hallreadability.plugin";
import { version682HomeCleanup } from "./version682homecleanup.plugin";
import { version682MyPlayerEditors } from "./version682myplayereditors.plugin";
import { version684CommissionerFab } from "./version684commissionerfab.plugin";
import { version685HomeCompact } from "./version685homecompact.plugin";
import { version686RemovePlayerTimeline } from "./version686removeplayertimeline.plugin";
import { version687MyPlayerCompact } from "./version687myplayercompact.plugin";
import { version688MyPlayerPolish } from "./version688myplayerpolish.plugin";
import { commissionerRecalibration } from "./commissionerRecalibration.plugin";
import { version70DefensiveStats } from "./version70defensivestats.plugin";
import { version71ProfileHistory } from "./version71profilehistory.plugin";
import { version72WeeklyMvp } from "./version72weeklymvp.plugin";

function replaceRequired(source: string, search: string, replacement: string): string {
  if (!source.includes(search)) {
    throw new Error(`Close Sunday patch could not find expected source: ${search.slice(0, 90)}`);
  }
  return source.replace(search, replacement);
}

function closeSundayFeature(): Plugin {
  return {
    name: "ys-guys-close-sunday",
    enforce: "pre",
    transform(source, id) {
      if (!id.endsWith("/src/App.tsx")) return null;
      let code = source;
      code = replaceRequired(code,'notes?:string; status:"open"|"locked"|"cancelled"; rsvps:RunRsvp[];','notes?:string; status:"open"|"locked"|"cancelled"|"closed"; rsvps:RunRsvp[];');
      code = replaceRequired(code,'const nextRun=orderedRuns.find(run=>run.date>=todayKey&&run.status!=="cancelled")??orderedRuns[orderedRuns.length-1];','const nextRun=orderedRuns.find(run=>run.date>=todayKey&&!(["cancelled","closed"] as SundayRun["status"][]).includes(run.status));');
      code = replaceRequired(code,'const upcoming=[...runs].filter(run=>run.date>=new Date().toLocaleDateString("en-CA")).sort((a,b)=>a.date.localeCompare(b.date));\n  const [selectedId,setSelectedId]=useState(upcoming[0]?.id??runs[runs.length-1]?.id??"");','const publicRuns=runs.filter(run=>run.status!=="closed");\n  const upcoming=[...publicRuns].filter(run=>run.date>=new Date().toLocaleDateString("en-CA")).sort((a,b)=>a.date.localeCompare(b.date));\n  const [selectedId,setSelectedId]=useState(upcoming[0]?.id??publicRuns[publicRuns.length-1]?.id??"");');
      code = replaceRequired(code,'const run=runs.find(item=>item.id===selectedId)??upcoming[0]??runs[0];','const run=publicRuns.find(item=>item.id===selectedId)??upcoming[0]??publicRuns[0];');
      code = replaceRequired(code,'{runs.length>1&&<div className="runSelector">{[...runs].sort((a,b)=>b.date.localeCompare(a.date)).map(item=>','{publicRuns.length>1&&<div className="runSelector">{[...publicRuns].sort((a,b)=>b.date.localeCompare(a.date)).map(item=>');
      code = replaceRequired(code,'const nextRun=[...runs].sort((a,b)=>a.date.localeCompare(b.date)).find(run=>run.date>=new Date().toLocaleDateString("en-CA")&&run.status!=="cancelled");','const nextRun=[...runs].sort((a,b)=>a.date.localeCompare(b.date)).find(run=>run.date>=new Date().toLocaleDateString("en-CA")&&!(["cancelled","closed"] as SundayRun["status"][]).includes(run.status));');
      code = replaceRequired(code,'  const generateSundays=()=>{',`  const closeRun=(run:SundayRun)=>{
    if(!confirm(\`Close \${formatRunDate(run.date)}? Attendance and recorded data will be preserved, and the next Sunday will become active.\`))return;
    const nextDate=localDate(run.date);nextDate.setDate(nextDate.getDate()+7);const nextDateKey=nextDate.toLocaleDateString("en-CA");
    const existingNext=runs.find(item=>item.date===nextDateKey);
    const updated=runs.map(item=>item.id===run.id?{...item,status:"closed" as const}:existingNext&&item.id===existingNext.id?{...item,status:"open" as const}:item);
    const nextRun:SundayRun|undefined=existingNext?undefined:{...run,id:makeId("run"),date:nextDateKey,status:"open",rsvps:[],deadline:""};
    onChange([...(updated),...(nextRun?[nextRun]:[])].sort((a,b)=>a.date.localeCompare(b.date)));
    setDraft(empty);
  };
  const generateSundays=()=>{`);
      code = replaceRequired(code,'<label>Status<select value={draft.status} onChange={event=>setDraft({...draft,status:event.target.value as SundayRun["status"]})}><option value="open">Open for RSVPs</option><option value="locked">Locked</option><option value="cancelled">Cancelled</option></select></label>','<label>Status<select value={draft.status} onChange={event=>setDraft({...draft,status:event.target.value as SundayRun["status"]})}><option value="open">Open for RSVPs</option><option value="locked">Locked</option><option value="cancelled">Cancelled</option><option value="closed">Closed / archived</option></select></label>');
      code = replaceRequired(code,'<button onClick={()=>onConvert(run)}>Create game</button><button onClick={()=>setDraft({...run,rsvps:run.rsvps.map(item=>({...item}))})}>Edit</button><button className="deleteLink" onClick={()=>remove(run.id)}>Delete</button>','<button onClick={()=>onConvert(run)}>Create game</button>{run.status!=="closed"&&<button className="closeSundayButton" onClick={()=>closeRun(run)}>Close Sunday</button>}<button onClick={()=>setDraft({...run,rsvps:run.rsvps.map(item=>({...item}))})}>Edit</button><button className="deleteLink" onClick={()=>remove(run.id)}>Delete</button>');
      code = replaceRequired(code,'.runManageRow{grid-template-columns:minmax(0,1fr) auto auto auto}', '.runManageRow{grid-template-columns:minmax(0,1fr) auto auto auto auto}.closeSundayButton{background:#fff6d8!important;color:#765613!important;border:1px solid #ead18a!important}');
      code = replaceRequired(code,'.calendarRun.cancelled{background:#f8e8e8;color:#963e3e}', '.calendarRun.cancelled{background:#f8e8e8;color:#963e3e}.calendarRun.closed{background:#edf0f4;color:#58677a}');
      code = replaceRequired(code,'run.status==="cancelled"?"Cancelled":`${runCounts(run).going} going`','run.status==="cancelled"?"Cancelled":run.status==="closed"?"Closed":`${runCounts(run).going} going`');
      return { code, map: null };
    },
  };
}

export default defineConfig({plugins:[closeSundayFeature(),version632Feature(),version64Feature(),version65Feature(),version66Feature(),version66NavigationFix(),version66HomeComponent(),version67MyPlayer(),version671Readability(),version673HomePolish(),version68AroundLeague(),version681HallReadability(),version682HomeCleanup(),version682MyPlayerEditors(),version684CommissionerFab(),version685HomeCompact(),version686RemovePlayerTimeline(),version687MyPlayerCompact(),version688MyPlayerPolish(),commissionerRecalibration(),version70DefensiveStats(),version71ProfileHistory(),version72WeeklyMvp(),react()]});
