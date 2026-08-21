import type { Plugin } from "vite";

export function version7Components():Plugin{
  return {name:"ys-guys-version-7-components",enforce:"pre",transform(source,id){
    let code=source;
    if(id.endsWith("/src/components/HomeDashboard.tsx")){
      code=code.replace('onChoosePlayer:()=>void; onOpenPlayer:(player:PlayerLike)=>void; onNavigate:(view:string)=>void;','onChoosePlayer:()=>void; onOpenPlayer:(player:PlayerLike)=>void; onNavigate:(view:string)=>void; onOpenNews:(storyId:string)=>void;');
      code=code.replace('formatDate,onRsvp,onChoosePlayer,onOpenPlayer,onNavigate','formatDate,onRsvp,onChoosePlayer,onOpenPlayer,onNavigate,onOpenNews');
      code=code.replace('<div className="homeSectionTitle"><b>WEEKLY NEWS</b><button onClick={()=>onNavigate("community")}>VIEW ALL →</button></div>','<div className="homeSectionTitle"><b>WEEKLY NEWS</b><button onClick={()=>featuredStory?onOpenNews(featuredStory.id):onNavigate("news")}>VIEW ALL →</button></div>');
      code=code.replace('<button className="homeFeature" onClick={()=>onNavigate("community")}','<button className="homeFeature" onClick={()=>onOpenNews(featuredStory.id)}');
      code=code.replace('key={story.id} onClick={()=>onNavigate("community")}>','key={story.id} onClick={()=>onOpenNews(story.id)}>');
      return {code,map:null};
    }
    if(id.endsWith("/src/components/AroundLeague.tsx")){
      code=code.replace('pts:number;reb:number;ast:number;photoUrl?:string','pts:number;reb:number;ast:number;steals?:number;blocks?:number;photoUrl?:string');
      code=code.replace('type PerGameSortKey="name"|"ppg"|"rpg"|"apg"|"wins"|"losses";','type PerGameSortKey="name"|"ppg"|"rpg"|"apg"|"spg"|"bpg"|"wins"|"losses";');
      code=code.replace('type TotalSortKey="name"|"pts"|"reb"|"ast"|"wins"|"losses";','type TotalSortKey="name"|"pts"|"reb"|"ast"|"steals"|"blocks"|"wins"|"losses";');
      code=code.replace('apg:avg(p.ast,p),wins:p.wins,losses:p.losses','apg:avg(p.ast,p),spg:avg(p.steals??0,p),bpg:avg(p.blocks??0,p),wins:p.wins,losses:p.losses');
      code=code.replace('ast:p.ast,wins:p.wins,losses:p.losses','ast:p.ast,steals:p.steals??0,blocks:p.blocks??0,wins:p.wins,losses:p.losses');
      code=code.replace('<th><button onClick={()=>setSort("apg")}>APG{arrow("apg")}</button></th><th><button onClick={()=>setSort("wins")}>W{arrow("wins")}</button></th>','<th><button onClick={()=>setSort("apg")}>APG{arrow("apg")}</button></th><th><button onClick={()=>setSort("spg")}>SPG{arrow("spg")}</button></th><th><button onClick={()=>setSort("bpg")}>BPG{arrow("bpg")}</button></th><th><button onClick={()=>setSort("wins")}>W{arrow("wins")}</button></th>');
      code=code.replace('<td>{avg(player.ast,player)}</td><td>{player.wins}</td>','<td>{avg(player.ast,player)}</td><td>{avg(player.steals??0,player)}</td><td>{avg(player.blocks??0,player)}</td><td>{player.wins}</td>');
      code=code.replace('<th><button onClick={()=>setTotalSort("ast")}>AST{totalArrow("ast")}</button></th><th><button onClick={()=>setTotalSort("wins")}>W{totalArrow("wins")}</button></th>','<th><button onClick={()=>setTotalSort("ast")}>AST{totalArrow("ast")}</button></th><th><button onClick={()=>setTotalSort("steals")}>STL{totalArrow("steals")}</button></th><th><button onClick={()=>setTotalSort("blocks")}>BLK{totalArrow("blocks")}</button></th><th><button onClick={()=>setTotalSort("wins")}>W{totalArrow("wins")}</button></th>');
      code=code.replace('<td>{player.ast}</td><td>{player.wins}</td>','<td>{player.ast}</td><td>{player.steals??0}</td><td>{player.blocks??0}</td><td>{player.wins}</td>');
      return {code,map:null};
    }
    return null;
  }};
}
