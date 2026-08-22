import type { Plugin } from "vite";

function required(source:string, search:string, replacement:string, label:string){
  if(!source.includes(search)) throw new Error(`Commissioner recalibration patch could not find ${label}`);
  return source.replace(search,replacement);
}

export function commissionerRecalibration():Plugin{
  return {
    name:"ys-guys-commissioner-overall-recalibration",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx")) return null;
      let code=source;

      code=required(code,
        '  signatureBadge?:string; photoUrl?:string; bannerColor?:string; overallOverride?:number;\n  defenseRating?:number; formulaOverall?:number;',
        '  signatureBadge?:string; photoUrl?:string; bannerColor?:string; overallOverride?:number;\n  defenseRating?:number; formulaOverall?:number; ratingRecalibratedAt?:string; ratingRecalibratedFrom?:number; ratingRecalibratedTo?:number;',
        'Player recalibration fields'
      );

      code=required(code,
`function applyOverallMovement(previous:Player[],next:Player[],games:Game[]=[]){
  return next.map(player=>{
    const prior=previous.find(item=>item.id===player.id);
    const raw=calculatedOverall(player,next,games);
    if(raw===null)return {...player,formulaOverall:undefined};
    const before=prior?overallRating(prior,previous):null;
    if(before===null)return {...player,formulaOverall:raw};
    return {...player,formulaOverall:Math.max(before-2,Math.min(before+2,raw))};
  });
}`,
`function applyOverallMovement(previous:Player[],next:Player[],games:Game[]=[]){
  return next.map(player=>{
    const prior=previous.find(item=>item.id===player.id);
    const raw=calculatedOverall(player,next,games);
    if(raw===null)return prior?.ratingRecalibratedAt?{...player,formulaOverall:prior.formulaOverall,overallOverride:undefined}:{...player,formulaOverall:undefined};
    const before=prior?overallRating(prior,previous,games):null;
    if(before===null)return {...player,formulaOverall:raw};
    if(prior?.ratingRecalibratedAt){
      const priorRaw=calculatedOverall(prior,previous,games);
      if(priorRaw===null)return {...player,formulaOverall:before,overallOverride:undefined};
      const movement=Math.max(-2,Math.min(2,raw-priorRaw));
      return {...player,formulaOverall:Math.max(40,Math.min(99,before+movement)),overallOverride:undefined};
    }
    return {...player,formulaOverall:Math.max(before-2,Math.min(before+2,raw))};
  });
}`,
        'recalibrated rating movement'
      );

      code=required(code,
        '    const clean={...draft,id:draft.id||makeId("player"),name:draft.name.trim(),nickname:draft.nickname.trim(),awards:draft.awards.filter(Boolean),formulaOverall:undefined};',
        '    const current=editing?players.find(player=>player.id===draft.id):undefined;const target=typeof draft.overallOverride==="number"?Math.max(40,Math.min(99,Math.round(draft.overallOverride))):undefined;const priorRating=current?overallRating(current,players):null;const recalibrating=target!==undefined;const clean={...draft,id:draft.id||makeId("player"),name:draft.name.trim(),nickname:draft.nickname.trim(),awards:draft.awards.filter(Boolean),overallOverride:undefined,formulaOverall:recalibrating?target:(current?.ratingRecalibratedAt?current.formulaOverall:undefined),ratingRecalibratedAt:recalibrating?new Date().toISOString():current?.ratingRecalibratedAt,ratingRecalibratedFrom:recalibrating?(priorRating??target):current?.ratingRecalibratedFrom,ratingRecalibratedTo:recalibrating?target:current?.ratingRecalibratedTo};',
        'PlayerManager save behavior'
      );

      code=required(code,
        '<label>Overall rating<input min="40" max="99" type="number" value={draft.overallOverride??""} onChange={e=>setDraft({...draft,overallOverride:e.target.value===""?undefined:Number(e.target.value)})} placeholder={String(calculatedOverall(draft,players)??"PROV")}/><small>{draft.overallOverride===undefined?`Automatic: ${calculatedOverall(draft,players)??"PROV"}`:`Commissioner override · automatic would be ${calculatedOverall(draft,players)??"PROV"}`}</small></label>',
        '<label>Recalibrate Overall<input min="40" max="99" type="number" value={draft.overallOverride??""} onChange={e=>setDraft({...draft,overallOverride:e.target.value===""?undefined:Number(e.target.value)})} placeholder={String((draft.id?overallRating(players.find(player=>player.id===draft.id)??draft,players):calculatedOverall(draft,players))??"PROV")}/><small>{draft.overallOverride===undefined?`Current official: ${(draft.id?overallRating(players.find(player=>player.id===draft.id)??draft,players):calculatedOverall(draft,players))??"PROV"} · calculated today: ${calculatedOverall(draft,players)??"PROV"}. Leave blank unless correcting the baseline.`:`New baseline: ${Math.max(40,Math.min(99,Math.round(draft.overallOverride)))}. Future rating movement continues normally from here.`}</small>{draft.id&&players.find(player=>player.id===draft.id)?.ratingRecalibratedAt&&<small>Last recalibration: {players.find(player=>player.id===draft.id)?.ratingRecalibratedFrom} → {players.find(player=>player.id===draft.id)?.ratingRecalibratedTo} · {new Date(players.find(player=>player.id===draft.id)!.ratingRecalibratedAt!).toLocaleDateString()}</small>}</label>',
        'recalibration editor field'
      );

      code=required(code,
        '<button onClick={()=>setDraft({...p,awards:[...p.awards]})}>Edit</button>',
        '<button onClick={()=>setDraft({...p,awards:[...p.awards],overallOverride:undefined})}>Edit</button>',
        'player edit reset'
      );

      return {code,map:null};
    }
  };
}
