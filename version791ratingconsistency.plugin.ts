import type { Plugin } from "vite";

export function version791RatingConsistency():Plugin{
  return {
    name:"ys-guys-version-791-rating-consistency",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      const start=source.indexOf("function percentile(");
      const end=source.indexOf("function archetype",start);
      if(start<0||end<0)throw new Error("Rating consistency patch could not locate the official OVR functions");
      const replacement=`function percentile(value:number,values:number[],lowerIsBetter=false){
  if(values.length<2)return 50;
  const below=values.filter(item=>lowerIsBetter?item>value:item<value).length;
  const equal=values.filter(item=>item===value).length;
  return Math.max(0,Math.min(100,100*(below+Math.max(0,equal-1)/2)/(values.length-1)));
}
function ratingFromPercentile(value:number){return Math.max(50,Math.min(99,Math.round(50+value*.49)));}
function overallComponents(p:Player,roster:Player[]){
  const eligible=roster.filter(player=>gp(player)>=1);
  if(!eligible.some(player=>player.id===p.id))return {scoring:50,rebounding:50,playmaking:50,defense:50,ballSecurity:50};
  const scoring=ratingFromPercentile(percentile(avg(p.pts,p),eligible.map(player=>avg(player.pts,player))));
  const rebounding=ratingFromPercentile(percentile(avg(p.reb,p),eligible.map(player=>avg(player.reb,player))));
  const playmaking=ratingFromPercentile(percentile(avg(p.ast,p),eligible.map(player=>avg(player.ast,player))));
  const defensiveEligible=eligible.filter(player=>(player.defensiveGp??0)>0);
  const defense=(p.defensiveGp??0)>0?ratingFromPercentile(percentile(defensiveAvg(p,p),defensiveEligible.map(player=>defensiveAvg(player,player)))):50;
  const turnoverAvoidance=ratingFromPercentile(percentile(avg(p.turnovers,p),eligible.map(player=>avg(player.turnovers,player)),true));
  const assistTurnover=p.turnovers?p.ast/p.turnovers:p.ast;
  const assistTurnoverValues=eligible.map(player=>player.turnovers?player.ast/player.turnovers:player.ast);
  const efficiency=ratingFromPercentile(percentile(assistTurnover,assistTurnoverValues));
  const ballSecurity=Math.round(turnoverAvoidance*.70+efficiency*.30);
  return {scoring,rebounding,playmaking,defense,ballSecurity};
}
function formulaImpact(p:Player,roster:Player[]){
  const components=overallComponents(p,roster);
  return components.scoring*.25+components.rebounding*.20+components.playmaking*.20+components.defense*.20+components.ballSecurity*.15;
}
function calculatedOverall(p:Player,roster:Player[],games:Game[]=[]){
  void games;
  return Math.max(50,Math.min(99,Math.round(formulaImpact(p,roster))));
}
function overallRating(p:Player,roster:Player[],games:Game[]=[]){
  if(typeof p.overallOverride==="number")return Math.max(50,Math.min(99,Math.round(p.overallOverride)));
  if(typeof p.formulaOverall==="number")return Math.max(50,Math.min(99,Math.round(p.formulaOverall)));
  return calculatedOverall(p,roster,games);
}
function applyOverallMovement(previous:Player[],next:Player[],games:Game[]=[]){
  return next.map(player=>{
    const prior=previous.find(item=>item.id===player.id);
    const raw=calculatedOverall(player,next,games);
    const before=prior?overallRating(prior,previous,games):raw;
    return {...player,formulaOverall:Math.max(before-2,Math.min(before+2,raw))};
  });
}
`;
      return {code:source.slice(0,start)+replacement+source.slice(end),map:null};
    }
  };
}
