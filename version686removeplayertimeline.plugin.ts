import type { Plugin } from "vite";

function replaceRequired(source:string,search:string,replacement:string){
  if(!source.includes(search)) throw new Error(`Version 6.8.6 timeline removal could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

export function version686RemovePlayerTimeline():Plugin{
  return {
    name:"ys-guys-version-686-remove-player-timeline",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx")) return null;
      const code=replaceRequired(
        source,
        '  {isMyPlayer&&<MyPlayerPerformance sessions={playerSessions}/>}\n',
        ''
      );
      return {code,map:null};
    }
  };
}
