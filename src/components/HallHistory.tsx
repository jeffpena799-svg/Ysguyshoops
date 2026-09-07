import { useMemo, useState } from "react";

type Player = {
  id: string;
  name: string;
  photoUrl?: string;
  wins: number;
  losses: number;
  pts: number;
  reb: number;
  ast: number;
  weeklyMvpCredits?: Array<{ count: number; season?: string }>;
};

type Poll = {
  id: string;
  category: string;
  status: "open" | "closed";
  officialWinnerId?: string;
  deadline?: string;
  finalizedAt?: string;
  createdAt: string;
};

type Award = { season: string; name: string; winner: string; icon: string };
type Season = { name: string; status: string; games: number; champion: string };
type SundaySession = { id: string; date: string };
type Milestone = { category: string; threshold: number; hallPoints: number; banner: string };
type HallResume = {
  total: number;
  milestonePoints: number;
  awardPoints: number;
  weeklyMvpCount: number;
  weeklyMvpPoints: number;
  milestones: Milestone[];
  status: string;
};

type HallTab = "progress" | "mvp" | "records" | "history";

type Props<T extends Player> = {
  players: T[];
  polls: Poll[];
  awards: Award[];
  seasons: Season[];
  sundaySessions: SundaySession[];
  updatedAt: string | null;
  onOpen: (player: T) => void;
  getHallResume: (player: T) => HallResume;
};

const tabs: Array<{ id: HallTab; label: string; eyebrow: string }> = [
  { id: "progress", label: "Hall Progress", eyebrow: "Road to 100%" },
  { id: "mvp", label: "Weekly MVPs", eyebrow: "Sunday honors" },
  { id: "records", label: "Records", eyebrow: "Career leaders" },
  { id: "history", label: "History", eyebrow: "League archive" },
];

const number = new Intl.NumberFormat("en-US");
const WIN_PERCENTAGE_MINIMUM = 50;
const bannerGuide = [
  { category: "Points", maximum: 36, milestones: [
    { threshold: 500, banner: "Bucket Getter", points: 2 },
    { threshold: 1000, banner: "Walking Bucket", points: 3 },
    { threshold: 2500, banner: "Walking Heat Check", points: 6 },
    { threshold: 5000, banner: "Bucket Factory", points: 10 },
    { threshold: 8000, banner: "Master of Buckets", points: 15 },
  ] },
  { category: "Rebounds", maximum: 36, milestones: [
    { threshold: 250, banner: "Board Crasher", points: 2 },
    { threshold: 500, banner: "Glass Cleaner", points: 3 },
    { threshold: 1000, banner: "Chairman of the Boards", points: 5 },
    { threshold: 2000, banner: "Board Hoarder", points: 6 },
    { threshold: 3500, banner: "Landlord of the Paint", points: 10 },
    { threshold: 6000, banner: "Master of the Glass", points: 10 },
  ] },
  { category: "Assists", maximum: 36, milestones: [
    { threshold: 100, banner: "Dime Dropper", points: 2 },
    { threshold: 250, banner: "Table Setter", points: 3 },
    { threshold: 500, banner: "Pass First, Ask Later", points: 5 },
    { threshold: 1000, banner: "Floor General", points: 6 },
    { threshold: 1500, banner: "Court Visionary", points: 10 },
    { threshold: 2500, banner: "Master of Dimes", points: 10 },
  ] },
  { category: "Wins", maximum: 36, milestones: [
    { threshold: 50, banner: "Dub Disciple", points: 2 },
    { threshold: 100, banner: "Sunday Regular", points: 3 },
    { threshold: 250, banner: "Deacon of Dubs", points: 4 },
    { threshold: 500, banner: "Sunday Service Veteran", points: 5 },
    { threshold: 750, banner: "Minister of Wins", points: 6 },
    { threshold: 1000, banner: "Apostle of Victory", points: 6 },
    { threshold: 1250, banner: "The Chosen One", points: 10 },
  ] },
  { category: "STL+BLK", maximum: 36, milestones: [
    { threshold: 25, banner: "Sticky Fingers", points: 2 },
    { threshold: 50, banner: "No-Fly Zone", points: 3 },
    { threshold: 100, banner: "Closed for Service", points: 5 },
    { threshold: 250, banner: "Stock Market", points: 6 },
    { threshold: 500, banner: "Wolf of Wall Street", points: 10 },
    { threshold: 750, banner: "Department of Defense", points: 10 },
  ], note: "Official tracking began Aug. 16, 2026." },
] as const;

function initials(name: string) {
  return name.split(" ").map(part => part[0]).join("").slice(0, 2).toUpperCase();
}

function formatValue(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function dateKey(poll: Poll) {
  return (poll.deadline || poll.finalizedAt || poll.createdAt).slice(0, 10);
}

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(year, month - 1, day));
}

function leaders<T extends Player>(players: T[], key: "pts" | "reb" | "ast" | "wins") {
  const highest = Math.max(0, ...players.map(player => player[key]));
  return players.filter(player => player[key] === highest).map(player => player.name).join(" / ");
}

function PlayerAvatar({ player }: { player: Player }) {
  return player.photoUrl
    ? <img className="hhAvatar" src={player.photoUrl} alt="" />
    : <span className="hhAvatar hhInitials" aria-hidden="true">{initials(player.name)}</span>;
}

export default function HallHistory<T extends Player>({ players, polls, awards, seasons, sundaySessions, updatedAt, onOpen, getHallResume }: Props<T>) {
  const [activeTab, setActiveTab] = useState<HallTab>("progress");
  const [showFormula, setShowFormula] = useState(false);

  const hallLeaders = useMemo(() => [...players].sort((a, b) => getHallResume(b).total - getHallResume(a).total || a.name.localeCompare(b.name)), [players, getHallResume]);
  const weeklyWinners = useMemo(() => polls
    .filter(poll => poll.category === "Weekly Award" && poll.status === "closed" && poll.officialWinnerId)
    .map(poll => ({ poll, player: players.find(player => player.id === poll.officialWinnerId) }))
    .filter((entry): entry is { poll: Poll; player: T } => Boolean(entry.player))
    .sort((a, b) => dateKey(b.poll).localeCompare(dateKey(a.poll))), [players, polls]);
  const mvpLeaders = useMemo(() => players
    .map(player => ({ player, count: getHallResume(player).weeklyMvpCount }))
    .filter(entry => entry.count > 0)
    .sort((a, b) => b.count - a.count || a.player.name.localeCompare(b.player.name)), [players, getHallResume]);
  const milestones = useMemo(() => players
    .flatMap(player => getHallResume(player).milestones.map(milestone => ({ player, milestone })))
    .sort((a, b) => b.milestone.hallPoints - a.milestone.hallPoints || a.player.name.localeCompare(b.player.name)), [players, getHallResume]);

  const qualifiedForWinPercentage = players.filter(player => player.wins + player.losses >= WIN_PERCENTAGE_MINIMUM);
  const winPercentageLeader = [...qualifiedForWinPercentage].sort((a, b) => {
    const aPct = a.wins / (a.wins + a.losses);
    const bPct = b.wins / (b.wins + b.losses);
    return bPct - aPct || b.wins - a.wins;
  })[0];
  const mostWins = Math.max(0, ...players.map(player => player.wins));
  const recordRows = [
    { label: "Most Points", value: number.format(Math.max(0, ...players.map(player => player.pts))), holder: leaders(players, "pts"), note: "Career total" },
    { label: "Most Rebounds", value: number.format(Math.max(0, ...players.map(player => player.reb))), holder: leaders(players, "reb"), note: "Career total" },
    { label: "Most Assists", value: number.format(Math.max(0, ...players.map(player => player.ast))), holder: leaders(players, "ast"), note: "Career total" },
    { label: "Most Wins", value: number.format(mostWins), holder: leaders(players, "wins"), note: "Career total" },
    winPercentageLeader
      ? { label: "Best Win Percentage", value: `${((winPercentageLeader.wins / (winPercentageLeader.wins + winPercentageLeader.losses)) * 100).toFixed(1)}%`, holder: winPercentageLeader.name, note: `${winPercentageLeader.wins}–${winPercentageLeader.losses} · Minimum ${WIN_PERCENTAGE_MINIMUM} games` }
      : { label: "Best Win Percentage", value: "—", holder: "No player has qualified yet", note: `Minimum ${WIN_PERCENTAGE_MINIMUM} recorded games` },
  ];

  return <div className="hallHistoryShell">
    <header className="hhHeader">
      <span>LEGACY CENTER</span>
      <h1>Hall &amp; History</h1>
      <p>Hall progress, weekly honors, records, and league history—organized in one place.</p>
    </header>

    <nav className="hhTabs" role="tablist" aria-label="Hall and History sections">
      {tabs.map(tab => <button
        key={tab.id}
        id={`hh-tab-${tab.id}`}
        type="button"
        role="tab"
        aria-selected={activeTab === tab.id}
        aria-controls={`hh-panel-${tab.id}`}
        className={activeTab === tab.id ? "active" : ""}
        onClick={() => setActiveTab(tab.id)}
      ><small>{tab.eyebrow}</small><b>{tab.label}</b></button>)}
    </nav>

    {activeTab === "progress" && <section className="hhPanel" id="hh-panel-progress" role="tabpanel" aria-labelledby="hh-tab-progress">
      <div className="hhPanelTitle"><div><span>100% TO QUALIFY</span><h2>Hall Progress</h2></div><button type="button" onClick={() => setShowFormula(value => !value)} aria-expanded={showFormula}>{showFormula ? "Hide guide" : "How it works"}</button></div>
      {showFormula && <div className="hhGuide">
        <b>Hall progress is earned, not estimated.</b>
        <span>Career milestones + official awards + 0.5% for every Weekly MVP.</span>
      </div>}
      {!hallLeaders.some(player => getHallResume(player).total >= 100) && <p className="hhNote">No player has reached the 100% induction mark yet.</p>}
      <div className="hhList">
        {hallLeaders.map((player, index) => { const resume = getHallResume(player); const progress = Math.min(100, resume.total); return <button className="hhPlayerRow" type="button" key={player.id} onClick={() => onOpen(player)}>
          <strong className="hhRank">{index + 1}</strong><PlayerAvatar player={player}/><span className="hhIdentity"><b>{player.name}</b><small>{resume.status} · {resume.weeklyMvpCount} MVP{resume.weeklyMvpCount === 1 ? "" : "s"}</small><i><em style={{ width: `${progress}%` }}/></i></span><strong className="hhValue">{formatValue(progress)}%</strong>
        </button>})}
      </div>
    </section>}

    {activeTab === "mvp" && <section className="hhPanel" id="hh-panel-mvp" role="tabpanel" aria-labelledby="hh-tab-mvp">
      <div className="hhPanelTitle"><div><span>0.5% HALL CREDIT EACH</span><h2>Weekly MVPs</h2></div></div>
      <h3 className="hhSubhead">Recent winners</h3>
      <div className="hhList">
        {weeklyWinners.length ? weeklyWinners.map(({ poll, player }) => <button className="hhSimpleRow" type="button" key={poll.id} onClick={() => onOpen(player)}><time>{formatDate(dateKey(poll))}</time><span><PlayerAvatar player={player}/><b>{player.name}</b></span></button>) : <p className="hhEmpty">No Weekly MVP winner has been recorded yet.</p>}
      </div>
      <h3 className="hhSubhead">All-time totals</h3>
      <div className="hhList">
        {mvpLeaders.map(({ player, count }, index) => <button className="hhPlayerRow hhMvpRow" type="button" key={player.id} onClick={() => onOpen(player)}><strong className="hhRank">{index + 1}</strong><PlayerAvatar player={player}/><span className="hhIdentity"><b>{player.name}</b><small>+{formatValue(count * 0.5)}% Hall progress</small></span><strong className="hhValue">{count}</strong></button>)}
      </div>
    </section>}

    {activeTab === "records" && <section className="hhPanel" id="hh-panel-records" role="tabpanel" aria-labelledby="hh-tab-records">
      <div className="hhPanelTitle"><div><span>VERIFIED FROM PLAYER TOTALS</span><h2>Record Book</h2></div></div>
      <div className="hhList hhRecordList">
        {recordRows.map(record => <article className="hhRecordRow" key={record.label}><span><small>{record.label}</small><b>{record.holder}</b><em>{record.note}</em></span><strong>{record.value}</strong></article>)}
      </div>
    </section>}

    {activeTab === "history" && <section className="hhPanel" id="hh-panel-history" role="tabpanel" aria-labelledby="hh-tab-history">
      <div className="hhPanelTitle"><div><span>LEAGUE ARCHIVE</span><h2>History</h2></div></div>
      <h3 className="hhSubhead">Official awards</h3>
      <div className="hhList">{awards.map((award, index) => <article className="hhHistoryRow" key={`${award.season}-${award.name}-${index}`}><span className="hhHistoryIcon">{award.icon}</span><span><small>{award.season} · {award.name}</small><b>{award.winner}</b></span></article>)}</div>
      <h3 className="hhSubhead">Official banner guide</h3>
      <p className="hhBannerIntro">Career milestone rewards stack. Each category offers up to 36% Hall Progress.</p>
      <div className="hhBannerGuide">
        {bannerGuide.map(group => <details key={group.category}>
          <summary><span><b>{group.category}</b><small>{group.milestones.length} banners</small></span><strong>{group.maximum}% max</strong></summary>
          <div className="hhBannerRows">
            {group.milestones.map(milestone => <div key={`${group.category}-${milestone.threshold}`}><strong>{number.format(milestone.threshold)}</strong><span><b>{milestone.banner}</b><small>Career {group.category}</small></span><em>+{milestone.points}%</em></div>)}
            {"note" in group && <p>{group.note}</p>}
          </div>
        </details>)}
      </div>
      <h3 className="hhSubhead">Milestone banners</h3>
      <div className="hhList">{milestones.length ? milestones.map(({ player, milestone }) => <button className="hhHistoryRow" type="button" key={`${player.id}-${milestone.category}-${milestone.threshold}`} onClick={() => onOpen(player)}><span className="hhHistoryIcon">★</span><span><small>{player.name} · +{milestone.hallPoints}%</small><b>{milestone.banner}</b><em>{number.format(milestone.threshold)} {milestone.category.replace("Career ", "")}</em></span></button>) : <p className="hhEmpty">No milestone banner has been earned yet.</p>}</div>
      <h3 className="hhSubhead">Seasons</h3>
      <div className="hhList">{seasons.map(season => {
        const year = season.name.match(/\b(20\d{2})\b/)?.[1];
        const recordedSundays = year ? sundaySessions.filter(session => session.date.startsWith(year)).length : 0;
        const countLabel = recordedSundays > 0 ? `${recordedSundays} recorded Sunday${recordedSundays === 1 ? "" : "s"}` : "Pre-digital archive";
        const hasChampion = season.champion && !["tbd", "—", "-"].includes(season.champion.trim().toLowerCase());
        return <article className="hhSeasonRow" key={season.name}><span><small>{season.status}</small><b>{season.name}</b><em>{countLabel}{hasChampion ? ` · Champion: ${season.champion}` : ""}</em></span></article>;
      })}</div>
    </section>}

    {updatedAt && <p className="hhUpdated">League records synced {formatDate(updatedAt)}</p>}
    <style>{styles}</style>
  </div>;
}

const styles = `
.hallHistoryShell{max-width:960px;margin:0 auto;padding:20px 16px 96px;color:#102746}.hhHeader{padding:20px 4px 16px}.hhHeader>span,.hhPanelTitle span{color:#9a7728;font-size:12px;font-weight:900;letter-spacing:.12em}.hhHeader h1{margin:5px 0 7px;font-size:clamp(30px,7vw,48px);line-height:1}.hhHeader p{max-width:650px;margin:0;color:#607086;font-size:15px;line-height:1.5}.hhTabs{position:sticky;top:0;z-index:8;display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;padding:8px;margin-bottom:14px;border:1px solid rgba(199,162,77,.32);border-radius:18px;background:rgba(246,249,252,.96);box-shadow:0 8px 24px rgba(10,45,94,.08);backdrop-filter:blur(12px)}.hhTabs button{min-height:58px;padding:8px 6px;border:0;border-radius:12px;background:transparent;color:#52657d;text-align:left;cursor:pointer}.hhTabs small{display:block;margin-bottom:2px;color:#8491a2;font-size:10px;font-weight:800;line-height:1.1}.hhTabs b{font-size:14px}.hhTabs button.active{background:#0a2d5e;color:#fff;box-shadow:0 5px 13px rgba(10,45,94,.22)}.hhTabs button.active small{color:#d8bc71}.hhPanel{border:1px solid rgba(199,162,77,.36);border-radius:20px;background:#fff;padding:16px;box-shadow:0 12px 34px rgba(10,45,94,.08)}.hhPanelTitle{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.hhPanelTitle h2{margin:3px 0 0;font-size:24px}.hhPanelTitle>button{min-height:40px;padding:0 13px;border:1px solid #d5dde7;border-radius:10px;background:#f6f8fb;color:#0a2d5e;font-size:13px;font-weight:900}.hhGuide,.hhNote,.hhEmpty{margin:0 0 12px;padding:12px 14px;border-radius:12px;background:#f4f7fa;color:#5b6b7e;font-size:13px;line-height:1.45}.hhGuide{display:flex;flex-direction:column}.hhGuide b{color:#102746}.hhList{overflow:hidden;border:1px solid #e2e7ed;border-radius:14px;background:#fff}.hhPlayerRow,.hhSimpleRow,.hhHistoryRow{width:100%;min-height:64px;border:0;border-top:1px solid #e8ecf1;background:#fff;color:#102746;text-align:left}.hhList>:first-child{border-top:0}.hhPlayerRow{display:grid;grid-template-columns:28px 42px minmax(0,1fr) auto;align-items:center;gap:10px;padding:10px 12px;cursor:pointer}.hhRank{color:#9a7728;font-size:14px;text-align:center}.hhAvatar{width:42px;height:42px;border-radius:50%;object-fit:cover;background:#eaf0f6}.hhInitials{display:grid;place-items:center;color:#0a2d5e;font-size:13px;font-weight:900}.hhIdentity{min-width:0;display:flex;flex-direction:column}.hhIdentity b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:15px}.hhIdentity small{margin-top:2px;color:#6c7c8f;font-size:12px}.hhIdentity i{height:5px;margin-top:7px;overflow:hidden;border-radius:999px;background:#e6ebf1}.hhIdentity em{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#c7a24d,#e2c66f)}.hhValue{font-size:18px}.hhSubhead{margin:18px 2px 8px;font-size:14px;letter-spacing:.03em}.hhSimpleRow{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 12px}.hhSimpleRow time{color:#637388;font-size:13px;font-weight:800}.hhSimpleRow>span{display:flex;align-items:center;gap:9px}.hhSimpleRow .hhAvatar{width:34px;height:34px}.hhMvpRow .hhIdentity small{margin-top:3px}.hhRecordRow{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:76px;padding:11px 14px;border-top:1px solid #e8ecf1}.hhRecordList>:first-child{border-top:0}.hhRecordRow>span,.hhHistoryRow>span:last-child,.hhSeasonRow>span{min-width:0;display:flex;flex-direction:column}.hhRecordRow small,.hhHistoryRow small,.hhSeasonRow small{color:#9a7728;font-size:11px;font-weight:900;letter-spacing:.06em;text-transform:uppercase}.hhRecordRow b,.hhHistoryRow b,.hhSeasonRow b{margin-top:2px;font-size:15px}.hhRecordRow em,.hhHistoryRow em,.hhSeasonRow em{margin-top:2px;color:#6c7c8f;font-size:12px;font-style:normal}.hhRecordRow>strong{flex:0 0 auto;color:#0a2d5e;font-size:23px}.hhHistoryRow{display:grid;grid-template-columns:40px minmax(0,1fr);align-items:center;gap:10px;padding:10px 12px}.hhHistoryIcon{width:36px;height:36px;display:grid;place-items:center;border-radius:10px;background:#f5ecd2;color:#9a7728;font-size:18px}.hhSeasonRow{min-height:62px;padding:11px 13px;border-top:1px solid #e8ecf1}.hhUpdated{text-align:center;color:#8290a1;font-size:11px;margin:14px 0 0}.hhBannerIntro{margin:0 2px 8px;color:#65768a;font-size:13px;line-height:1.4}.hhBannerGuide{overflow:hidden;border:1px solid #e2e7ed;border-radius:14px;background:#fff}.hhBannerGuide details{border-top:1px solid #e8ecf1}.hhBannerGuide details:first-child{border-top:0}.hhBannerGuide summary{min-height:58px;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 13px;cursor:pointer;list-style:none}.hhBannerGuide summary::-webkit-details-marker{display:none}.hhBannerGuide summary>span{display:flex;flex-direction:column}.hhBannerGuide summary b{font-size:15px}.hhBannerGuide summary small{margin-top:2px;color:#718095;font-size:12px}.hhBannerGuide summary>strong{color:#9a7728;font-size:13px}.hhBannerRows{padding:0 11px 10px;background:#f8fafc}.hhBannerRows>div{display:grid;grid-template-columns:58px minmax(0,1fr) auto;align-items:center;gap:9px;min-height:52px;border-top:1px solid #e4e9ef}.hhBannerRows>div>strong{font-size:14px}.hhBannerRows>div>span{display:flex;min-width:0;flex-direction:column}.hhBannerRows>div b{font-size:14px}.hhBannerRows>div small{color:#718095;font-size:12px}.hhBannerRows>div em{color:#0a2d5e;font-size:14px;font-style:normal;font-weight:900}.hhBannerRows>p{margin:7px 0 0;color:#65768a;font-size:12px}
@media(max-width:640px){.hallHistoryShell{padding:12px 10px 92px}.hhHeader{padding:12px 4px}.hhHeader p{font-size:14px}.hhTabs{grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;border-radius:15px}.hhTabs button{min-height:52px;padding:7px 9px}.hhTabs small{font-size:10px}.hhTabs b{font-size:14px}.hhPanel{padding:12px;border-radius:16px}.hhPanelTitle h2{font-size:21px}.hhPlayerRow{grid-template-columns:24px 38px minmax(0,1fr) auto;gap:8px;padding:9px}.hhAvatar{width:38px;height:38px}.hhValue{font-size:17px}.hhRecordRow{min-height:70px;padding:10px 11px}.hhRecordRow>strong{font-size:20px}}
`;
