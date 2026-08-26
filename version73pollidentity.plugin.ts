import type { Plugin } from "vite";

function replaceRequired(source:string,search:string,replacement:string){
  if(!source.includes(search))throw new Error(`Poll identity patch could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

export function version73PollIdentity():Plugin{
  return {
    name:"ys-guys-version-73-poll-identity",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      let code=source;

      code=replaceRequired(code,
        'const activeRuleVote=polls.find(poll=>poll.status==="open"&&!poll.archived&&(!poll.deadline||new Date(poll.deadline).getTime()>=Date.now()));',
        'const activeRuleVote=[...polls].filter(poll=>poll.category!=="Weekly Award"&&poll.status==="open"&&!poll.archived&&(!poll.deadline||new Date(poll.deadline).getTime()>=Date.now())).sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0];'
      );

      code=replaceRequired(code,
        '  const [voterId,setVoterId]=useState(defaultPlayerId);const [choices,setChoices]=useState<Record<string,string>>({});const [saving,setSaving]=useState("");const [error,setError]=useState("");',
        '  const [voterId,setVoterId]=useState(defaultPlayerId);const [choices,setChoices]=useState<Record<string,string>>({});const [saving,setSaving]=useState("");const [error,setError]=useState("");useEffect(()=>{if(!defaultPlayerId)return;setVoterId(defaultPlayerId);const existing:Record<string,string>={};polls.forEach(poll=>{const found=poll.votes.find(item=>item.playerId===defaultPlayerId);if(found)existing[poll.id]=found.nomineeId});setChoices(existing)},[defaultPlayerId,polls]);'
      );

      const picker='<label className="voterSelect">Your player profile<select value={voterId} onChange={event=>{const id=event.target.value;setVoterId(id);const existing:Record<string,string>={};polls.forEach(poll=>{const found=poll.votes.find(item=>item.playerId===id);if(found)existing[poll.id]=found.nomineeId});setChoices(existing)}}><option value="">Choose your name</option>{players.map(player=><option value={player.id} key={player.id}>{player.name}</option>)}</select></label>';
      const identity='{defaultPlayerId?<div className="voterIdentity"><span>{players.find(player=>player.id===defaultPlayerId)?.photoUrl?<img src={players.find(player=>player.id===defaultPlayerId)?.photoUrl} alt=""/>:initials(players.find(player=>player.id===defaultPlayerId)?.name??"YG")}</span><div><small>VOTING AS</small><b>{players.find(player=>player.id===defaultPlayerId)?.name??"My Player"}</b></div><strong>✓ MY PLAYER</strong></div>:'+picker+'}';
      code=replaceRequired(code,picker,identity);

      const css=`
.voterIdentity{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;margin:0 0 12px;padding:12px 14px;border:1px solid #d4b45d;border-radius:14px;background:#071f42;color:white}.voterIdentity>span{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;overflow:hidden;background:#d4b45d;color:#071f42;font-weight:1000}.voterIdentity img{width:100%;height:100%;object-fit:cover}.voterIdentity div{display:grid}.voterIdentity small{color:#d4b45d!important;font-size:9px;letter-spacing:.13em}.voterIdentity b{color:white!important}.voterIdentity>strong{font-size:10px;color:#d4b45d!important}@media(max-width:520px){.voterIdentity{grid-template-columns:auto 1fr}.voterIdentity>strong{grid-column:1/-1;text-align:center}}
`;
      code=replaceRequired(code,"const styles = `",`const styles = \`${css}`);
      return {code,map:null};
    }
  };
}
