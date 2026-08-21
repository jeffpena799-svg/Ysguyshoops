import type { Plugin } from "vite";

function replaceRequired(source:string,search:string,replacement:string){
  if(!source.includes(search))throw new Error(`Weekly MVP patch could not find: ${search.slice(0,100)}`);
  return source.replace(search,replacement);
}

export function version692WeeklyMvp():Plugin{
  return {name:"ys-guys-version-692-weekly-mvp",enforce:"pre",transform(source,id){
    if(!id.endsWith("/src/App.tsx"))return null;
    let code=source;

    code=replaceRequired(code,
      '  officialWinnerId?:string; finalizedAt?:string;',
      '  officialWinnerId?:string; finalizedAt?:string; weekOf?:string; entryMode?:"vote"|"commissioner";'
    );
    code=replaceRequired(code,
      'type AdminTab = "dashboard"|"review"|"rankings"|"runs"|"sessions"|"games"|"players"|"history"|"news"|"polls"|"awards"|"branding"|"data";',
      'type AdminTab = "dashboard"|"review"|"rankings"|"runs"|"sessions"|"games"|"players"|"history"|"news"|"weekly-mvp"|"polls"|"awards"|"branding"|"data";'
    );
    code=replaceRequired(code,
      "['news','Community News'],['polls','Voting']",
      "['news','Community News'],['weekly-mvp','Weekly MVP'],['polls','Voting']"
    );
    code=replaceRequired(code,
      "        {adminTab==='news' && <NewsManager news={news} onChange={(next)=>{setNews(next);saveAll({news:next});}}/>}",
      "        {adminTab==='news' && <NewsManager news={news} onChange={(next)=>{setNews(next);saveAll({news:next});}}/>}\n        {adminTab==='weekly-mvp' && <WeeklyMvpManager polls={polls} players={players} onChange={(next)=>{const nextPlayers=syncWeeklyMvpPollCredits(players,next);setPolls(next);setPlayers(nextPlayers);saveAll({polls:next,players:nextPlayers});}}/>}"
    );
    code=replaceRequired(code,
      '    {tab:"news",icon:"📰",title:"Publish news",copy:`${news.filter(item=>item.published).length} published stories`},',
      '    {tab:"news",icon:"📰",title:"Publish news",copy:`${news.filter(item=>item.published).length} published stories`},\n    {tab:"weekly-mvp",icon:"⭐",title:"Award Weekly MVP",copy:`${polls.filter(poll=>poll.category==="Weekly Award"&&poll.status==="closed"&&poll.officialWinnerId).length} official winners recorded`},'
    );

    const manager=`function WeeklyMvpManager({polls,players,onChange}:{polls:LeaguePoll[];players:Player[];onChange:(polls:LeaguePoll[])=>void}){
  const today=()=>new Date().toLocaleDateString("en-CA");
  const [weekOf,setWeekOf]=useState(today);
  const [winnerId,setWinnerId]=useState("");
  const [editingId,setEditingId]=useState("");
  const official=[...polls].filter(poll=>poll.category==="Weekly Award"&&poll.status==="closed"&&poll.officialWinnerId).sort((a,b)=>(b.weekOf??b.finalizedAt??b.createdAt).localeCompare(a.weekOf??a.finalizedAt??a.createdAt));
  const reset=()=>{setWeekOf(today());setWinnerId("");setEditingId("")};
  const awardDate=(poll:LeaguePoll)=>(poll.weekOf??poll.finalizedAt?.slice(0,10)??poll.createdAt.slice(0,10));
  const save=(event:React.FormEvent)=>{
    event.preventDefault();
    if(!weekOf||!winnerId)return alert("Choose the week and the Weekly MVP.");
    const duplicate=official.find(poll=>poll.id!==editingId&&awardDate(poll)===weekOf);
    if(duplicate){const winner=players.find(player=>player.id===duplicate.officialWinnerId)?.name??"another player";return alert(winner+" is already the official MVP for this week. Edit that entry instead.")}
    const previous=polls.find(poll=>poll.id===editingId);
    const entry:LeaguePoll={id:editingId||makeId("weekly-mvp"),title:"Weekly MVP · "+formatRunDate(weekOf),description:"Commissioner-awarded official Weekly MVP.",category:"Weekly Award",deadline:weekOf+"T23:59",status:"closed",nomineeIds:players.map(player=>player.id),votes:previous?.votes??[],createdAt:previous?.createdAt??new Date().toISOString(),officialWinnerId:winnerId,finalizedAt:weekOf+"T12:00:00",weekOf,entryMode:"commissioner"};
    onChange(editingId?polls.map(poll=>poll.id===editingId?entry:poll):[entry,...polls]);reset();
  };
  const edit=(poll:LeaguePoll)=>{setEditingId(poll.id);setWeekOf(awardDate(poll));setWinnerId(poll.officialWinnerId??"");window.scrollTo({top:0,behavior:"smooth"})};
  const remove=(poll:LeaguePoll)=>{const winner=players.find(player=>player.id===poll.officialWinnerId)?.name??"this player";if(confirm("Remove "+winner+"'s Weekly MVP for "+formatRunDate(awardDate(poll))+"? The 0.5% Hall of Fame credit will also be removed.")){onChange(polls.filter(item=>item.id!==poll.id));if(editingId===poll.id)reset()}};
  return <div className="managerGrid"><form className="adminCard weeklyMvpAdmin" onSubmit={save}><span className="weeklyMvpIcon">⭐</span><h2>{editingId?"Correct Weekly MVP":"Award Weekly MVP"}</h2><p>Select the run date and one official winner. Saving immediately adds one MVP and +0.5% to that player's Hall of Fame progress.</p><div className="formGrid"><label>Week / run date<input required type="date" value={weekOf} onChange={event=>setWeekOf(event.target.value)}/></label><label>Official winner<select required value={winnerId} onChange={event=>setWinnerId(event.target.value)}><option value="">Choose a player</option>{players.map(player=><option value={player.id} key={player.id}>{player.name}</option>)}</select></label></div>{winnerId&&<div className="weeklyMvpPreview"><b>{players.find(player=>player.id===winnerId)?.name}</b><span>+1 Weekly MVP</span><strong>+0.5% Hall of Fame</strong></div>}<div className="formActions"><button className="primary" type="submit">{editingId?"Save correction":"Award MVP"}</button>{editingId&&<button className="secondary" type="button" onClick={reset}>Cancel</button>}</div></form><ManageList title="Official Weekly MVP history" empty="No official Weekly MVPs recorded yet.">{official.map(poll=>{const winner=players.find(player=>player.id===poll.officialWinnerId);return <div className="manageRow" key={poll.id}><div><b>⭐ {winner?.name??"Unknown player"}</b><small>{formatRunDate(awardDate(poll))} · +0.5% Hall of Fame</small></div><button onClick={()=>edit(poll)}>Correct</button><button className="deleteLink" onClick={()=>remove(poll)}>Remove</button></div>})}</ManageList></div>;
}

`;
    code=replaceRequired(code,"function AwardManager(",manager+"function AwardManager(");
    const styles='\n.weeklyMvpAdmin{position:relative;overflow:hidden}.weeklyMvpIcon{display:grid;place-items:center;width:48px;height:48px;border-radius:15px;background:#fff6d8;font-size:25px;margin-bottom:14px}.weeklyMvpPreview{display:grid;grid-template-columns:1fr auto auto;gap:10px;align-items:center;margin-top:18px;padding:14px;border-radius:14px;background:#071f42;color:white}.weeklyMvpPreview span{font-size:12px;font-weight:800;color:#d8e1ed}.weeklyMvpPreview strong{color:#e8c876}.legacyMvpFormula{margin:0 0 18px;padding:11px 13px;border-radius:11px;background:rgba(199,162,77,.14);color:#f3d578;font-weight:900;font-size:12px}@media(max-width:640px){.weeklyMvpPreview{grid-template-columns:1fr}.weeklyMvpPreview span,.weeklyMvpPreview strong{font-size:12px}}\n';
    code=replaceRequired(code,'const styles = `','const styles = `'+styles);
    return {code,map:null};
  }};
}
