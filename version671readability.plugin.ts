import type { Plugin } from "vite";

export function version671Readability():Plugin{
  return {
    name:"ys-guys-version-671-readability",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx")) return null;
      const marker='`}</style><button className="backButton" onClick={onBack}>← All profiles</button>';
      if(!source.includes(marker)) throw new Error("Version 6.7.1 readability patch could not find the My Player style marker");
      const css=`
.profilePanel .section h2,.profileGameLog .section h2,.careerBests .section h2,.legacyPanel .section h2,.myPlayerPerformance .section h2{color:#172033!important;font-weight:900!important}
.profilePanel .section span,.profileGameLog .section span,.careerBests .section span,.legacyPanel .section span,.myPlayerPerformance .section span{color:#9a7425!important}
.profileGameLog .empty,.careerBests .empty{color:#667085!important}
.careerHighGrid article strong{color:#111827!important;font-weight:900!important;opacity:1!important}
.careerHighGrid article b{color:#263244!important;font-weight:800!important}
.careerHighGrid article span{color:#667085!important}
.careerHighGrid article small{color:#8b681f!important}
.profileGameLog .logHead,.profileGameLog .logRow{color:#263244!important}
.profileGameLog .logRow b{color:#172033!important}
.profileGameLog .logRow small{color:#667085!important}
.legacyPanel .legacyLevelHeader h3,.legacyPanel .legacySummary b,.legacyPanel .profileHonor b{color:#172033!important}
.legacyPanel .legacyLevelHeader strong{color:#8b681f!important}
.legacyPanel .legacyLevels span{color:#667085!important}.legacyPanel .legacyLevels span.reached{color:#8b681f!important}
.legacyPanel .legacySummary span{color:#667085!important;background:#f7f8fa!important}
.careerTimeline .careerTimelineList h3{color:#172033!important}.careerTimeline .careerTimelineList p{color:#667085!important}
`;
      return {code:source.replace(marker,`${css}\n\`}</style><button className="backButton" onClick={onBack}>← All profiles</button>`),map:null};
    }
  };
}
