import type { Plugin } from "vite";

export function version672GlobalTypography(): Plugin {
  return {
    name: "ys-guys-version-672-global-typography",
    enforce: "pre",
    transform(source, id) {
      if (!id.endsWith("/src/App.tsx")) return null;

      const marker = '</style><button className="backButton" onClick={onBack}>← All profiles</button>';
      if (!source.includes(marker)) {
        throw new Error("Version 6.7.2 typography patch could not find the shared style marker");
      }

      const css = [
        '',
        '/* Version 6.7.2 — shared typography on light surfaces */',
        ':where(.panel,.profilePanel,.adminCard,.recordCard,.awardCard,.seasonCard,.pollCard,.suggestionCard,.reviewItem,.playerCard,.timelineItem,.analyticsTable,.comparisonTable,.runCard,.calendarCard,.menuList>button,.communityCard,.storyCard,.newsCard,.hallCard,.milestoneBanner,.studioHelp,.dataCard,.managerGrid form,.managerGrid>section){--yg-ink:#172033;--yg-slate:#263244;--yg-muted:#667085;--yg-gold:#8b681f}',
        ':where(.panel,.profilePanel,.adminCard,.recordCard,.awardCard,.seasonCard,.pollCard,.suggestionCard,.reviewItem,.playerCard,.timelineItem,.analyticsTable,.comparisonTable,.runCard,.calendarCard,.communityCard,.storyCard,.newsCard,.hallCard,.milestoneBanner,.studioHelp,.dataCard,.managerGrid form,.managerGrid>section) :where(h1,h2,h3,h4){color:var(--yg-ink)!important;font-weight:900!important}',
        ':where(.panel,.profilePanel,.adminCard,.recordCard,.awardCard,.seasonCard,.pollCard,.suggestionCard,.reviewItem,.playerCard,.timelineItem,.analyticsTable,.comparisonTable,.runCard,.calendarCard,.communityCard,.storyCard,.newsCard,.hallCard,.milestoneBanner,.studioHelp,.dataCard,.managerGrid form,.managerGrid>section) :where(strong,.bigNumber,.statValue,.scoreValue){color:var(--yg-ink)!important;font-weight:900!important}',
        ':where(.panel,.profilePanel,.adminCard,.recordCard,.awardCard,.seasonCard,.pollCard,.suggestionCard,.reviewItem,.playerCard,.timelineItem,.analyticsTable,.comparisonTable,.runCard,.calendarCard,.communityCard,.storyCard,.newsCard,.hallCard,.milestoneBanner,.studioHelp,.dataCard,.managerGrid form,.managerGrid>section) :where(p,small,em,.subtitle,.description,.empty){color:var(--yg-muted)!important}',
        ':where(.panel,.profilePanel,.adminCard,.recordCard,.awardCard,.seasonCard,.pollCard,.suggestionCard,.reviewItem,.playerCard,.timelineItem,.analyticsTable,.comparisonTable,.runCard,.calendarCard,.communityCard,.storyCard,.newsCard,.hallCard,.milestoneBanner,.studioHelp,.dataCard,.managerGrid form,.managerGrid>section) :where(.section>span,.section small,.eyebrow,.pos,.label,legend){color:var(--yg-gold)!important;font-weight:800!important}',
        ':where(.panel,.profilePanel,.adminCard,.recordCard,.awardCard,.seasonCard,.pollCard,.suggestionCard,.reviewItem,.playerCard,.timelineItem,.analyticsTable,.comparisonTable,.runCard,.calendarCard,.communityCard,.storyCard,.newsCard,.hallCard,.milestoneBanner,.studioHelp,.dataCard,.managerGrid form,.managerGrid>section) :where(input,textarea,select){color:var(--yg-ink)!important}',
        ':where(.panel,.profilePanel,.adminCard,.recordCard,.awardCard,.seasonCard,.pollCard,.suggestionCard,.reviewItem,.playerCard,.timelineItem,.analyticsTable,.comparisonTable,.runCard,.calendarCard,.communityCard,.storyCard,.newsCard,.hallCard,.milestoneBanner,.studioHelp,.dataCard,.managerGrid form,.managerGrid>section) :where(label,b){color:var(--yg-slate)}',
        '/* Preserve white typography on intentional dark feature surfaces */',
        ':where(.universeHero,.homeDashboard,.sundayHero,.weeklyNews,.hero,.topbar,.sidebar,.bottomNav,.commissionerStatus,.recordHero,.awardBanner,.tradingCard,.quickRsvp,.darkCard) :where(h1,h2,h3,h4,strong,b,p,small,span){color:inherit}',
        ''
      ].join('\n');

      return {
        code: source.replace(marker, css + '</style><button className="backButton" onClick={onBack}>← All profiles</button>'),
        map: null,
      };
    },
  };
}
