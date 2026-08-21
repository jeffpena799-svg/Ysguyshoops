import type { Plugin } from "vite";

const withSeason='type View = "home" | "attendance" | "community" | "games" | "players" | "profile" | "compare" | "leaders" | "season-stats" | "more" | "records" | "awards" | "seasons" | "calendar" | "rules" | "hof" | "timeline" | "voting" | "studio" | "commissioner";';
const base='type View = "home" | "attendance" | "community" | "games" | "players" | "profile" | "compare" | "leaders" | "more" | "records" | "awards" | "seasons" | "calendar" | "rules" | "hof" | "timeline" | "voting" | "studio" | "commissioner";';
const v7='type View = "home" | "attendance" | "community" | "news" | "games" | "players" | "profile" | "compare" | "leaders" | "more" | "records" | "awards" | "seasons" | "calendar" | "rules" | "hof" | "timeline" | "voting" | "studio" | "commissioner";';
const v7WithSeason='type View = "home" | "attendance" | "community" | "news" | "games" | "players" | "profile" | "compare" | "leaders" | "season-stats" | "more" | "records" | "awards" | "seasons" | "calendar" | "rules" | "hof" | "timeline" | "voting" | "studio" | "commissioner";';

export function version7ViewPrepare():Plugin{
  return {name:"ys-guys-v7-view-prepare",enforce:"pre",transform(source,id){
    if(!id.endsWith("/src/App.tsx"))return null;
    if(!source.includes(withSeason))throw new Error("Version 7 view bridge could not find legacy season-stats view");
    return {code:source.replace(withSeason,base),map:null};
  }};
}

export function version7ViewRestore():Plugin{
  return {name:"ys-guys-v7-view-restore",enforce:"pre",transform(source,id){
    if(!id.endsWith("/src/App.tsx"))return null;
    if(!source.includes(v7))throw new Error("Version 7 view bridge could not find Version 7 view");
    return {code:source.replace(v7,v7WithSeason),map:null};
  }};
}
