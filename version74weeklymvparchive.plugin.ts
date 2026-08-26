import type { Plugin } from "vite";

function replaceRequired(source:string,search:string,replacement:string){
  if(!source.includes(search))throw new Error(`Weekly MVP archive patch could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

export function version74WeeklyMvpArchive():Plugin{
  return {
    name:"ys-guys-version-74-weekly-mvp-archive",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      let code=source;

      code=replaceRequired(code,
        '{view==="hof" && <HallHub players={players} awards={awards} seasons={seasons} records={records} updatedAt={cloudUpdatedAt} onOpen={openProfile}/>}',
        '{view==="hof" && <HallHub players={players} polls={polls} awards={awards} seasons={seasons} records={records} updatedAt={cloudUpdatedAt} onOpen={openProfile}/>}'
      );
      code=replaceRequired(code,
        'function HallHub({players,awards,seasons,records,updatedAt,onOpen}:{players:Player[];awards:Award[];seasons:typeof initialSeasons;records:RecordItem[];updatedAt:string|null;onOpen:(player:Player)=>void}){',
        'function HallHub({players,polls,awards,seasons,records,updatedAt,onOpen}:{players:Player[];polls:LeaguePoll[];awards:Award[];seasons:typeof initialSeasons;records:RecordItem[];updatedAt:string|null;onOpen:(player:Player)=>void}){'
      );
      code=replaceRequired(code,
        '  const banners=players.flatMap(player=>hallResume(player,awards).milestones.map(item=>({player,item})));',
        '  const banners=players.flatMap(player=>hallResume(player,awards).milestones.map(item=>({player,item})));\n  const weeklyMvpArchive=[...polls].filter(poll=>poll.category==="Weekly Award"&&poll.status==="closed"&&poll.officialWinnerId).sort((a,b)=>(b.deadline??b.finalizedAt??b.createdAt).localeCompare(a.deadline??a.finalizedAt??a.createdAt)).map(poll=>({poll,winner:players.find(player=>player.id===poll.officialWinnerId)})).filter((entry):entry is {poll:LeaguePoll;winner:Player}=>Boolean(entry.winner));'
      );
      code=replaceRequired(code,
        '<div className="hallJump"><a href="#hall-progress">Hall of Fame</a><a href="#record-book">Record Book</a>',
        '<div className="hallJump"><a href="#hall-progress">Hall of Fame</a><a href="#weekly-mvp-archive">Weekly MVPs</a><a href="#record-book">Record Book</a>'
      );
      const history='<section><Section eyebrow="0.5% EACH" title="Weekly MVP History"/><div className="recordGrid">{players.filter(player=>weeklyMvpWins(player)>0).sort((a,b)=>weeklyMvpWins(b)-weeklyMvpWins(a)).map(player=><article className="recordCard" key={`weekly-mvp-${player.id}`}><span>WEEKLY MVP</span><h3>{player.name}</h3><strong>{weeklyMvpWins(player)}</strong><b>+{formatHallValue(weeklyMvpWins(player)*WEEKLY_MVP_HALL_POINTS)}% Hall Progress</b><small>{[...new Set((player.weeklyMvpCredits??[]).map(credit=>credit.season))].join(" · ")}</small></article>)}</div></section>';
      const archive=history+'\n    <section id="weekly-mvp-archive"><Section eyebrow="OFFICIAL SUNDAY WINNERS" title="Weekly MVP Archive"/>{weeklyMvpArchive.length?<div className="weeklyMvpArchive">{weeklyMvpArchive.map(({poll,winner})=>{const date=(poll.deadline??poll.finalizedAt??poll.createdAt).slice(0,10);return <article key={poll.id}><time>{formatRunDate(date)}</time><strong>{winner.name}</strong></article>})}</div>:<div className="empty">The first dated Weekly MVP will appear here after it is recorded.</div>}</section>';
      code=replaceRequired(code,history,archive);

      code=replaceRequired(code,
        '  const visible=polls.filter(poll=>!poll.archived);const history=polls.filter(poll=>poll.archived||poll.status==="closed");',
        '  const visible=polls.filter(poll=>poll.category!=="Weekly Award"&&!poll.archived);const history=polls.filter(poll=>poll.category!=="Weekly Award"&&(poll.archived||poll.status==="closed"));'
      );

      const css=`
.weeklyMvpArchive{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.weeklyMvpArchive article{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;padding:16px 18px;border:1px solid rgba(199,162,77,.36);border-radius:15px;background:linear-gradient(135deg,#fffdf7,#f7edd1)}.weeklyMvpArchive time{font-size:12px;font-weight:900;color:#6d7b8d}.weeklyMvpArchive strong{font-size:18px;color:#102746}@media(max-width:680px){.weeklyMvpArchive{grid-template-columns:1fr}.weeklyMvpArchive article{padding:13px 14px}.weeklyMvpArchive time{font-size:11px}.weeklyMvpArchive strong{font-size:16px}}
`;
      code=replaceRequired(code,"const styles = `",`const styles = \`${css}`);
      return {code,map:null};
    }
  };
}
