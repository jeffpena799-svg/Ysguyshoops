import type { Plugin } from "vite";

export function version682HomeCleanup():Plugin{
  return {
    name:"ys-guys-version-682-home-cleanup",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/components/HomeDashboard.tsx"))return null;
      const pattern=/\n\s*<section className="homeQuick">[\s\S]*?<\/section>\n\n\s*<article className="homePlayer">/;
      if(!pattern.test(source))throw new Error("Version 6.8.2 could not find the Home Quick Access section");
      const code=source.replace(pattern,'\n\n      <article className="homePlayer">');
      return {code,map:null};
    }
  };
}
