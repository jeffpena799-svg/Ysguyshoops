import type { Plugin } from "vite";

export function version681HallReadability():Plugin{
  return {
    name:"ys-guys-version-681-hall-readability",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      const anchor='const styles = `';
      if(!source.includes(anchor))throw new Error("Version 6.8.1 Hall readability could not find app styles");
      const css=`\n/* Version 6.8.1 — Hall & History readability */\n#hall-progress .hallCard h3,#hall-progress .hallCard b,#hall-progress .legacyTracker b,#hall-progress .legacyTracker strong,#hall-progress .legacyTracker small{color:#172033!important}\n#hall-progress .legacyTracker small{color:#5f6b7c!important}\n#hall-progress + section .recordCard h3,#hall-progress + section .recordCard strong,#hall-progress + section .recordCard b,#record-book .recordCard h3,#record-book .recordCard strong,#record-book .recordCard b{color:#172033!important}\n#hall-progress + section .recordCard strong,#record-book .recordCard strong{font-weight:900!important}\n#hall-progress + section .recordCard small,#record-book .recordCard small{color:#66758a!important}\n#awards-hall .awardCard h3,#awards-hall .awardCard b{color:#172033!important}\n#awards-hall .awardCard small{color:#9b7628!important}\n#season-hall .seasonCard h3{color:#172033!important}\n#season-hall .seasonCard p{color:#66758a!important}\n#banner-hall .milestoneBanner b{color:#172033!important}\n#banner-hall .milestoneBanner em{color:#66758a!important}\n`;
      return {code:source.replace(anchor,anchor+css),map:null};
    }
  };
}
