import type { Plugin } from "vite";

function replaceRequired(source:string,search:string,replacement:string){
  if(!source.includes(search))throw new Error(`Version 6.5 patch could not find: ${search.slice(0,140)}`);
  return source.replace(search,replacement);
}

function replaceBetween(source:string,start:string,end:string,replacement:string){
  const from=source.indexOf(start);if(from<0)throw new Error(`Version 6.5 patch could not find start: ${start}`);
  const to=source.indexOf(end,from);if(to<0)throw new Error(`Version 6.5 patch could not find end: ${end}`);
  return source.slice(0,from)+replacement+source.slice(to);
}

export function version65Feature():Plugin{
  return {
    name:"ys-guys-version-6-5",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      let code=source;

      code=replaceRequired(code,
        '  officialWinnerId?:string; finalizedAt?:string;\n};',
        '  officialWinnerId?:string; finalizedAt?:string; archived?:boolean;\n};'
      );

      code=replaceRequired(code,
        'const initialBranding:LeagueBranding = { logoUrl:"/ys-guys-mark.jpeg", wordmark:"Y\'S GUYS", tagline:"League Universe" };',
        'const initialBranding:LeagueBranding = { logoUrl:"/ys-guys-logo.svg", wordmark:"Y\'S GUYS", tagline:"Commissioner Update" };'
      );

      code=code.split('src={branding.logoUrl||initialBranding.logoUrl}').join('src="/ys-guys-logo.svg"');

      code=replaceRequired(code,
        '  const latestRanking=rankings[0]??initialRankings[0];',
        '  const latestRanking=rankings[0]??initialRankings[0];\n  const activeRuleVote=polls.find(poll=>poll.category==="Rule Vote"&&poll.status==="open"&&!poll.archived&&(!poll.deadline||new Date(poll.deadline).getTime()>=Date.now()));'
      );

      code=replaceRequired(code,
        '        </section>\n        {nextRun&&<QuickRsvp',
        '        </section>\n        {activeRuleVote&&<button className="activeRuleVoteCard" onClick={()=>go("voting")}><span>🗳️</span><div><small>LEAGUE VOTE IN PROGRESS</small><h2>{activeRuleVote.title}</h2><p>{activeRuleVote.votes.length} player{activeRuleVote.votes.length===1?"":"s"} voted · Yes or No · Simple majority</p></div><b>Vote now →</b></button>}\n        {nextRun&&<QuickRsvp'
      );

      code=replaceRequired(code,
        '  const [pastedStats,setPastedStats]=useState("");',
        '  const [pastedStats,setPastedStats]=useState("");\n  const dictatedStatsRef=React.useRef<HTMLTextAreaElement>(null);'
      );

      code=replaceRequired(code,
        '<textarea value={pastedStats} onChange={event=>setPastedStats(event.target.value)} placeholder="Paste or type this Sunday’s stats…"/><button type="button" className="secondary" disabled={!pastedStats.trim()} onClick={parsePastedStats}>Interpret pasted stats</button>',
        '<textarea ref={dictatedStatsRef} value={pastedStats} onChange={event=>setPastedStats(event.target.value)} placeholder="Paste, type, or dictate this Sunday’s stats…"/><div className="dictationActions"><button type="button" className="dictateButton" onClick={()=>{dictatedStatsRef.current?.focus();setScanMessage("Keyboard opened. Tap the microphone on your phone keyboard, then read one player per line.")}}>🎙 Dictate Stats</button><button type="button" className="secondary" disabled={!pastedStats.trim()} onClick={parsePastedStats}>Process dictated stats</button></div><small className="dictationHint">Say: “Alex, nine games, five wins, thirty-two points, nine rebounds, five assists, one turnover.”</small>'
      );

      code=replaceBetween(code,'function ReviewCenter(','function PowerRankingManager(',`function ReviewCenter({submissions,players,polls,onChange,onPollsChange}:{submissions:LeagueSubmission[];players:Player[];polls:LeaguePoll[];onChange:(next:LeagueSubmission[],nextPlayers?:Player[])=>void;onPollsChange:(next:LeaguePoll[])=>void}){
  const pending=submissions.filter(item=>item.status==="pending");
  const act=(item:LeagueSubmission,status:LeagueSubmission["status"])=>{let nextPlayers:Player[]|undefined;if(status==="approved"&&item.type==="profile-photo"&&item.imageUrl)nextPlayers=players.map(player=>player.id===item.playerId?{...player,photoUrl:item.imageUrl}:player);onChange(submissions.map(entry=>entry.id===item.id?{...entry,status}:entry),nextPlayers)};
  const remove=(id:string)=>onChange(submissions.filter(item=>item.id!==id));
  const createVote=(item:LeagueSubmission)=>{
    const question=item.message.trim().replace(/[.]+$/g,"");
    const poll:LeaguePoll={id:makeId("rule-vote"),title:question.endsWith("?")?question:\`Should the league adopt: \${question}?\`,description:"Anonymous Yes/No league vote created from a player suggestion. Passes with a simple majority of votes cast.",category:"Rule Vote",deadline:"",status:"open",nomineeIds:["yes","no"],votes:[],createdAt:new Date().toISOString()};
    onPollsChange([poll,...polls]);act(item,"approved");
  };
  return <section className="adminCard"><Section eyebrow={\`\${pending.length} PENDING\`} title="Commissioner Review Center"/>{pending.length?pending.map(item=>{const player=players.find(entry=>entry.id===item.playerId);return <article className="reviewItem" key={item.id}>{item.imageUrl&&<img src={item.imageUrl} alt="Submitted"/>}<div><small>{item.type==="profile-photo"?"PROFILE PHOTO":"SUGGESTION"} · {new Date(item.createdAt).toLocaleString()}</small><h3>{player?.name??"Player"}</h3><p>{item.message}</p><div>{item.type==="suggestion"&&<button className="voteCreateButton" onClick={()=>createVote(item)}>🗳 Create Yes/No Vote</button>}<button className="primary" onClick={()=>act(item,"approved")}>{item.type==="profile-photo"?"Approve photo":"Mark used"}</button><button className="secondary" onClick={()=>act(item,"archived")}>Archive</button><button className="danger" onClick={()=>act(item,"rejected")}>Reject</button><button className="danger" onClick={()=>remove(item.id)}>Delete</button></div></div></article>}):<div className="empty">Nothing is waiting for review.</div>}</section>;
}

function PowerRankingManager(`);

      code=replaceRequired(code,
        '<ReviewCenter submissions={submissions} players={players} onChange={(next,nextPlayers)=>{setSubmissions(next);if(nextPlayers)setPlayers(nextPlayers);saveAll({submissions:next,players:nextPlayers??players});}}/>',
        '<ReviewCenter submissions={submissions} players={players} polls={polls} onChange={(next,nextPlayers)=>{setSubmissions(next);if(nextPlayers)setPlayers(nextPlayers);saveAll({submissions:next,players:nextPlayers??players});}} onPollsChange={(next)=>{setPolls(next);saveAll({polls:next});}}/>'
      );

      code=replaceBetween(code,'function VotingCenter(','function ShareStudio(',`function VotingCenter({polls,players,defaultPlayerId,onVote}:{polls:LeaguePoll[];players:Player[];defaultPlayerId:string;onVote:(pollId:string,voterId:string,nomineeId:string)=>Promise<void>}){
  const [voterId,setVoterId]=useState(defaultPlayerId);const [choices,setChoices]=useState<Record<string,string>>({});const [saving,setSaving]=useState("");const [error,setError]=useState("");
  const vote=async(poll:LeaguePoll)=>{const nomineeId=choices[poll.id];if(!voterId||!nomineeId)return;setSaving(poll.id);setError("");try{await onVote(poll.id,voterId,nomineeId)}catch(reason){setError(reason instanceof Error?reason.message:"Vote could not be saved")}finally{setSaving("")}};
  const visible=polls.filter(poll=>!poll.archived);const history=polls.filter(poll=>poll.archived||poll.status==="closed");
  return <Page eyebrow="LEAGUE GOVERNANCE · v6.5" title="League Votes" subtitle="Anonymous Yes or No ballots. One vote per player. Simple majority wins."><label className="voterSelect">Your player profile<select value={voterId} onChange={event=>{const id=event.target.value;setVoterId(id);const existing:Record<string,string>={};polls.forEach(poll=>{const found=poll.votes.find(item=>item.playerId===id);if(found)existing[poll.id]=found.nomineeId});setChoices(existing)}}><option value="">Choose your name</option>{players.map(player=><option value={player.id} key={player.id}>{player.name}</option>)}</select></label><p className="anonymousNote">Votes are anonymous in the app. Player identity is used only to enforce one ballot per player.</p>{error&&<div className="formError">{error}</div>}<div className="pollGrid">{visible.map(poll=>{const total=poll.votes.length,closed=poll.status==="closed"||Boolean(poll.deadline&&new Date(poll.deadline).getTime()<Date.now());if(poll.category==="Rule Vote"){const yes=poll.votes.filter(item=>item.nomineeId==="yes").length,no=poll.votes.filter(item=>item.nomineeId==="no").length,passed=total>0&&yes>total/2;return <article className="pollCard ruleVoteCard" key={poll.id}><header><span>RULE CHANGE</span><b>{closed?"CLOSED":"OPEN"}</b></header><h2>{poll.title}</h2><p>{poll.description}</p><div className="yesNoChoices">{(["yes","no"] as const).map(choice=><button disabled={closed||!voterId} className={choices[poll.id]===choice?"selected":""} onClick={()=>setChoices({...choices,[poll.id]:choice})} key={choice}><strong>{choice.toUpperCase()}</strong>{closed&&<small>{poll.votes.filter(item=>item.nomineeId===choice).length} votes</small>}</button>)}</div>{closed?<div className={passed?"voteResult passed":"voteResult failed"}>{passed?"PASSED":"FAILED"} · YES {yes} — NO {no}</div>:<button className="primary voteButton" disabled={!voterId||!choices[poll.id]||saving===poll.id} onClick={()=>vote(poll)}>{saving===poll.id?"Saving…":poll.votes.some(item=>item.playerId===voterId)?"Update anonymous vote":"Submit anonymous vote"}</button>}<footer>{total} recorded {total===1?"vote":"votes"}{poll.deadline?\` · Deadline \${new Date(poll.deadline).toLocaleString()}\`:""}</footer></article>}
    const nominees=poll.category==="Weekly Award"?players:poll.nomineeIds.map(id=>players.find(player=>player.id===id)).filter((player):player is Player=>Boolean(player));const officialWinner=players.find(player=>player.id===poll.officialWinnerId);return <article className="pollCard" key={poll.id}><header><span>{poll.category}</span><b>{closed?"CLOSED":"OPEN"}</b></header><h2>{poll.title}</h2><p>{poll.description}</p>{officialWinner&&<div className="successNote">🏆 Official Weekly MVP: {officialWinner.name}</div>}<div className="nomineeList">{nominees.map(player=>{const votes=poll.votes.filter(item=>item.nomineeId===player.id).length,percent=total?Math.round(votes/total*100):0;return <button disabled={closed||!voterId} className={choices[poll.id]===player.id?"selected":""} onClick={()=>setChoices({...choices,[poll.id]:player.id})} key={player.id}>{player.photoUrl?<img className="avatar photoAvatar" src={player.photoUrl} alt=""/>:<span className="avatar">{initials(player.name)}</span>}<div><b>{player.name}</b>{closed&&<i><em style={{width:\`\${percent}%\`}}/></i>}</div>{closed?<strong>{votes} · {percent}%</strong>:<small>{choices[poll.id]===player.id?"Selected":"Choose"}</small>}</button>})}</div>{!closed&&<button className="primary voteButton" disabled={!voterId||!choices[poll.id]||saving===poll.id} onClick={()=>vote(poll)}>{saving===poll.id?"Saving…":"Submit vote"}</button>}</article>})}</div>{history.length>0&&<section className="voteHistory"><Section eyebrow="PERMANENT RECORD" title="League Vote History"/>{history.map(poll=>{const yes=poll.votes.filter(item=>item.nomineeId==="yes").length,no=poll.votes.filter(item=>item.nomineeId==="no").length;return <article key={poll.id}><div><b>{poll.title}</b><small>{poll.finalizedAt?new Date(poll.finalizedAt).toLocaleDateString():new Date(poll.createdAt).toLocaleDateString()}</small></div><strong>{poll.officialWinnerId==="yes"?"ADOPTED":poll.officialWinnerId==="no"?"REJECTED":yes>no?"PASSED":"FAILED"}</strong><span>YES {yes} · NO {no}</span></article>})}</section>}</Page>;
}

function ShareStudio(`);

      code=replaceBetween(code,'function PollManager(','function AwardManager(',`function PollManager({polls,players,onChange}:{polls:LeaguePoll[];players:Player[];onChange:(polls:LeaguePoll[])=>void}){
  const empty:LeaguePoll={id:"",title:"",description:"",category:"Rule Vote",deadline:"",status:"open",nomineeIds:["yes","no"],votes:[],createdAt:new Date().toISOString(),archived:false};
  const [draft,setDraft]=useState<LeaguePoll>(empty);const editing=Boolean(draft.id);
  const save=(event:React.FormEvent)=>{event.preventDefault();if(!draft.title.trim())return alert("Add a vote question.");if(draft.category!=="Rule Vote"&&draft.nomineeIds.length<2)return alert("Choose at least two nominees.");const clean={...draft,id:draft.id||makeId("poll"),title:draft.title.trim(),description:draft.description.trim(),nomineeIds:draft.category==="Rule Vote"?["yes","no"]:draft.nomineeIds,createdAt:draft.createdAt||new Date().toISOString()};onChange(editing?polls.map(poll=>poll.id===clean.id?clean:poll):[clean,...polls]);setDraft(empty)};
  const patch=(id:string,update:Partial<LeaguePoll>)=>onChange(polls.map(poll=>poll.id===id?{...poll,...update}:poll));
  const remove=(id:string)=>{if(confirm("Delete this vote and all recorded ballots?"))onChange(polls.filter(poll=>poll.id!==id))};
  return <div className="managerGrid"><form className="adminCard" onSubmit={save}><h2>{editing?"Edit League Vote":"Create League Vote"}</h2><p>Rule votes are anonymous Yes/No ballots and pass with a simple majority.</p><div className="formGrid"><label>Vote type<select value={draft.category} onChange={event=>setDraft({...draft,category:event.target.value,nomineeIds:event.target.value==="Rule Vote"?["yes","no"]:[]})}><option>Rule Vote</option><option>Weekly Award</option><option>League Poll</option></select></label><label>Status<select value={draft.status} onChange={event=>setDraft({...draft,status:event.target.value as LeaguePoll["status"]})}><option value="open">Open</option><option value="closed">Closed</option></select></label><label className="wide">Question<input required value={draft.title} onChange={event=>setDraft({...draft,title:event.target.value})} placeholder="Should free throws be added on Sundays?"/></label><label className="wide">Explanation<textarea value={draft.description} onChange={event=>setDraft({...draft,description:event.target.value})} placeholder="Explain why the league is voting…"/></label><label className="wide">Deadline<input type="datetime-local" value={draft.deadline??""} onChange={event=>setDraft({...draft,deadline:event.target.value})}/></label>{draft.category!=="Rule Vote"&&<div className="wide nomineeChecks">{players.map(player=><label key={player.id}><input type="checkbox" checked={draft.nomineeIds.includes(player.id)} onChange={event=>setDraft({...draft,nomineeIds:event.target.checked?[...draft.nomineeIds,player.id]:draft.nomineeIds.filter(id=>id!==player.id)})}/>{player.name}</label>)}</div>}</div><div className="formActions"><button className="primary">{editing?"Save vote":"Publish vote"}</button>{editing&&<button type="button" className="secondary" onClick={()=>setDraft(empty)}>Cancel</button>}</div></form><ManageList title="League votes" empty="No votes created yet.">{polls.map(poll=>{const yes=poll.votes.filter(item=>item.nomineeId==="yes").length,no=poll.votes.filter(item=>item.nomineeId==="no").length;return <div className="manageRow governanceRow" key={poll.id}><div><b>{poll.title}</b><small>{poll.category} · {poll.status.toUpperCase()} · {poll.votes.length} votes{poll.archived?" · Archived":""}{poll.category==="Rule Vote"?\` · YES \${yes} / NO \${no}\`:""}</small></div><button onClick={()=>setDraft({...poll,nomineeIds:[...poll.nomineeIds],votes:[...poll.votes]})}>Edit</button>{poll.status==="open"?<button onClick={()=>patch(poll.id,{status:"closed",finalizedAt:new Date().toISOString()})}>Close</button>:<button onClick={()=>patch(poll.id,{status:"open",finalizedAt:undefined,officialWinnerId:undefined})}>Reopen</button>}{poll.category==="Rule Vote"&&poll.status==="closed"&&<><button className="adoptButton" onClick={()=>patch(poll.id,{officialWinnerId:"yes",finalizedAt:new Date().toISOString()})}>Adopt Rule</button><button onClick={()=>patch(poll.id,{officialWinnerId:"no",finalizedAt:new Date().toISOString()})}>Reject Rule</button></>}<button onClick={()=>patch(poll.id,{archived:!poll.archived})}>{poll.archived?"Restore":"Archive"}</button><button className="deleteLink" onClick={()=>remove(poll.id)}>Delete</button></div>})}</ManageList></div>;
}

function AwardManager(`);

      code=replaceBetween(code,'function RuleBook(){','function CommissionerDashboard(',`function RuleBook({polls}:{polls:LeaguePoll[]}){
  const sections=[{icon:"🏀",title:"Game Format",rules:["Games to 15. Keeps. Ball touches curtain out. Last game to 21."]},{icon:"🛡️",title:"Fouls",rules:["You can’t foul out."]},{icon:"📊",title:"Power Rankings",rules:["ChatGPT calculates the weekly Power Rankings to reduce personal bias."]},{icon:"🏛️",title:"Hall of Fame",rules:["Hall of Fame Formula is calculated by winning, performance, and awards."]},{icon:"🏆",title:"League Standard",rules:["Have fun win the day!"]}];
  const adopted=polls.filter(poll=>poll.category==="Rule Vote"&&poll.status==="closed"&&poll.officialWinnerId==="yes");
  return <Page eyebrow="OFFICIAL RULE BOOK · v6.5" title="How the Y's Guys universe operates." subtitle="The official rules of the Sunday run, including rules adopted by league vote."><div className="ruleHero"><img src="/ys-guys-logo.svg" alt="Y's Guys"/><div><b>LEAGUE STANDARD</b><h2>Have fun win the day!</h2></div></div><div className="rulesGrid">{sections.map((section,index)=><section className="ruleSection" key={section.title}><div><span>{section.icon}</span><small>ARTICLE {index+1}</small></div><h2>{section.title}</h2><ol start={index+1}>{section.rules.map(rule=><li key={rule}>{rule}</li>)}</ol></section>)}{adopted.length>0&&<section className="ruleSection adoptedRules"><div><span>🗳️</span><small>ADOPTED BY LEAGUE VOTE</small></div><h2>League-Adopted Rules</h2><ol>{adopted.map(poll=><li key={poll.id}><b>{poll.title}</b><small>Adopted {new Date(poll.finalizedAt??poll.createdAt).toLocaleDateString()}</small></li>)}</ol></section>}</div></Page>;
}

function CommissionerDashboard(`);

      code=replaceRequired(code,'{view==="rules" && <RuleBook/>}','{view==="rules" && <RuleBook polls={polls}/>}');

      code=replaceRequired(code,
        '.seasonStatFilters{display:flex;',
        '.activeRuleVoteCard{width:100%;margin:18px 0;padding:18px 20px;border:1px solid #d4b45d;border-radius:20px;background:linear-gradient(135deg,#fff9e8,#eef4fb);display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:14px;text-align:left;color:#0A2D5E}.activeRuleVoteCard>span{font-size:30px}.activeRuleVoteCard small{font-weight:1000;letter-spacing:.12em;color:#9b7628}.activeRuleVoteCard h2{margin:3px 0}.activeRuleVoteCard p{margin:0;color:#65748a}.activeRuleVoteCard>b{white-space:nowrap}.dictationActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.dictateButton,.voteCreateButton,.adoptButton{background:#c7a24d!important;color:#082b59!important;border:0!important;font-weight:1000!important}.dictationHint{display:block;margin-top:8px;color:#65748a}.anonymousNote{background:#eef4fb;border:1px solid #d4dfeb;border-radius:12px;padding:10px 12px;color:#5d6d82}.yesNoChoices{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0}.yesNoChoices button{padding:18px;border:2px solid #dce3ec;border-radius:16px;background:white;color:#0A2D5E}.yesNoChoices button.selected{border-color:#c7a24d;background:#fff8e2}.yesNoChoices strong{font-size:20px}.yesNoChoices small{display:block;margin-top:5px}.voteResult{padding:13px;border-radius:12px;font-weight:1000;text-align:center}.voteResult.passed{background:#e3f5e9;color:#236b3b}.voteResult.failed{background:#fdeaea;color:#a53030}.voteHistory{margin-top:24px}.voteHistory article{display:grid;grid-template-columns:1fr auto auto;gap:12px;align-items:center;padding:14px;border-bottom:1px solid #e4e8ee}.voteHistory article div{display:grid}.voteHistory small{color:#7b8798}.governanceRow{grid-template-columns:minmax(220px,1fr) repeat(6,auto)!important}.adoptedRules{grid-column:1/-1}.adoptedRules li{display:grid;gap:4px}.adoptedRules small{color:#7b8798}.ruleHero img{width:58px;height:58px;object-fit:cover;border-radius:14px}.brandMark{object-fit:cover!important}.seasonStatFilters{display:flex;'
      );

      code=code.split('version:"6.4"').join('version:"6.5"');
      code=code.split('v6.4').join('v6.5');
      code=code.split('Version 6.4').join('Version 6.5');
      code=code.split('League Universe · v6.3.1').join('Commissioner Update · v6.5');
      return {code,map:null};
    }
  };
}
