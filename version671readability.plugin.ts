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

.panel h1,.panel h2,.panel h3,.profilePanel h1,.profilePanel h2,.profilePanel h3,.adminCard h1,.adminCard h2,.adminCard h3,.recordCard h1,.recordCard h2,.recordCard h3,.awardCard h1,.awardCard h2,.awardCard h3,.seasonCard h1,.seasonCard h2,.seasonCard h3,.pollCard h1,.pollCard h2,.pollCard h3,.suggestionCard h1,.suggestionCard h2,.suggestionCard h3,.reviewItem h1,.reviewItem h2,.reviewItem h3,.playerCard h1,.playerCard h2,.playerCard h3,.timelineItem h1,.timelineItem h2,.timelineItem h3,.analyticsTable h1,.analyticsTable h2,.analyticsTable h3,.comparisonTable h1,.comparisonTable h2,.comparisonTable h3,.runCard h1,.runCard h2,.runCard h3,.calendarCard h1,.calendarCard h2,.calendarCard h3,.communityCard h1,.communityCard h2,.communityCard h3,.storyCard h1,.storyCard h2,.storyCard h3,.newsCard h1,.newsCard h2,.newsCard h3,.hallCard h1,.hallCard h2,.hallCard h3,.milestoneBanner h1,.milestoneBanner h2,.milestoneBanner h3,.studioHelp h1,.studioHelp h2,.studioHelp h3{color:#172033!important;font-weight:900!important}
.panel p,.panel small,.profilePanel p,.profilePanel small,.adminCard p,.adminCard small,.recordCard p,.recordCard small,.awardCard p,.awardCard small,.seasonCard p,.seasonCard small,.pollCard p,.pollCard small,.suggestionCard p,.suggestionCard small,.reviewItem p,.reviewItem small,.playerCard p,.playerCard small,.timelineItem p,.timelineItem small,.analyticsTable p,.analyticsTable small,.comparisonTable p,.comparisonTable small,.runCard p,.runCard small,.calendarCard p,.calendarCard small,.communityCard p,.communityCard small,.storyCard p,.storyCard small,.newsCard p,.newsCard small,.hallCard p,.hallCard small,.milestoneBanner p,.milestoneBanner small,.studioHelp p,.studioHelp small{color:#667085!important}
.panel strong,.profilePanel strong,.adminCard strong,.recordCard strong,.awardCard strong,.seasonCard strong,.pollCard strong,.suggestionCard strong,.reviewItem strong,.playerCard strong,.timelineItem strong,.analyticsTable strong,.comparisonTable strong,.runCard strong,.calendarCard strong,.communityCard strong,.storyCard strong,.newsCard strong,.hallCard strong,.milestoneBanner strong,.studioHelp strong{color:#172033!important;font-weight:900!important}
.panel .section span,.profilePanel .section span,.adminCard .section span,.recordCard .section span,.awardCard .section span,.seasonCard .section span,.pollCard .section span,.suggestionCard .section span,.reviewItem .section span,.playerCard .section span,.timelineItem .section span,.communityCard .section span,.storyCard .section span,.newsCard .section span,.hallCard .section span{color:#8b681f!important;font-weight:800!important}
.panel input,.panel textarea,.panel select,.profilePanel input,.profilePanel textarea,.profilePanel select,.adminCard input,.adminCard textarea,.adminCard select,.suggestionCard input,.suggestionCard textarea,.suggestionCard select{color:#172033!important}
.universeHero h1,.universeHero h2,.universeHero h3,.universeHero h4,.universeHero strong,.universeHero b,.universeHero p,.universeHero small,.universeHero span,.homeDashboard h1,.homeDashboard h2,.homeDashboard h3,.homeDashboard strong,.homeDashboard b,.homeDashboard p,.homeDashboard small,.homeDashboard span,.sundayHero h1,.sundayHero h2,.sundayHero h3,.sundayHero strong,.sundayHero b,.sundayHero p,.sundayHero small,.sundayHero span,.weeklyNews h1,.weeklyNews h2,.weeklyNews h3,.weeklyNews strong,.weeklyNews b,.weeklyNews p,.weeklyNews small,.weeklyNews span,.quickRsvp h1,.quickRsvp h2,.quickRsvp h3,.quickRsvp strong,.quickRsvp b,.quickRsvp p,.quickRsvp small,.quickRsvp span,.recordHero h1,.recordHero h2,.recordHero h3,.recordHero strong,.recordHero b,.recordHero p,.recordHero small,.recordHero span,.awardBanner h1,.awardBanner h2,.awardBanner h3,.awardBanner strong,.awardBanner b,.awardBanner p,.awardBanner small,.awardBanner span,.tradingCard h1,.tradingCard h2,.tradingCard h3,.tradingCard strong,.tradingCard b,.tradingCard p,.tradingCard small,.tradingCard span{color:inherit!important}
`;
      return {code:source.replace(marker,`${css}\n\`}</style><button className="backButton" onClick={onBack}>← All profiles</button>`),map:null};
    }
  };
}
