import React, { useMemo, useState } from "react";

type PlayerLike={
  id:string;name:string;wins?:number;losses?:number;pts?:number;reb?:number;ast?:number;
  stocks?:number;stl?:number;blk?:number;defensiveGp?:number;
  photoUrl?:string;overallOverride?:number
};
type RunLike={
  id:string;date:string;startTime?:string;location?:string;deadline?:string;notes?:string;
  rsvps?:Array<{playerId:string;status:string}>
};
type NewsLike={id:string;headline:string;summary?:string;category?:string;imageUrl?:string};
type GameLike={id:string;date?:string;title?:string;teamA?:string;teamB?:string;scoreA?:number;scoreB?:number;mvp?:string};
type RankingLike={playerId?:string;playerName:string;rank:number|null;movement:number|null;dnp?:boolean};
type PollLike={id?:string;title?:string;description?:string;category?:string;deadline?:string;votes?:unknown[]}|null;

type Props={
  players:PlayerLike[]; nextRun?:RunLike; featuredStory?:NewsLike; publishedNews:NewsLike[];
  latestFinal?:GameLike; rankings:RankingLike[]; myPlayer?:PlayerLike; activeVote?:PollLike;
  formatDate:(value:string)=>string; onRsvp:(runId:string,status:"going"|"maybe"|"out")=>Promise<void>;
  onChoosePlayer:()=>void; onOpenPlayer:(player:PlayerLike)=>void; onNavigate:(view:string)=>void;
};

function safeNumber(value:unknown){
  return typeof value==="number"&&Number.isFinite(value)?value:0;
}
function defensiveTotal(player:PlayerLike){
  return player.stocks??(safeNumber(player.stl)+safeNumber(player.blk));
}
function initials(name?:string){
  return (name||"YG").split(/\s+/).filter(Boolean).slice(0,2).map(part=>part[0]).join("").toUpperCase();
}
function overall(player?:PlayerLike){
  if(!player)return 0;
  if(typeof player.overallOverride==="number")return player.overallOverride;
  const games=safeNumber(player.wins)+safeNumber(player.losses);
  return Math.max(60,Math.min(99,Math.round(70+safeNumber(player.wins)*.7+safeNumber(player.pts)/Math.max(1,games)*.8)));
}

export default function HomeDashboard(props:Props){
  const {
    players=[],nextRun,featuredStory,publishedNews=[],myPlayer,activeVote,
    formatDate,onRsvp,onChoosePlayer,onOpenPlayer,onNavigate
  }=props;
  const [saving,setSaving]=useState<string>("");
  const [message,setMessage]=useState("");
  const confirmed=useMemo(()=>nextRun?.rsvps?.filter(item=>item.status==="going")??[],[nextRun]);
  const responded=nextRun?.rsvps?.length??0;
  const confirmedPlayers=confirmed
    .map(item=>players.find(player=>player.id===item.playerId))
    .filter(Boolean) as PlayerLike[];

  const submit=async(status:"going"|"maybe"|"out")=>{
    if(!nextRun)return;
    if(!myPlayer){onChoosePlayer();return;}
    try{
      setSaving(status);
      setMessage("");
      await onRsvp(nextRun.id,status);
      setMessage("Response saved");
    }catch(error){
      setMessage(error instanceof Error?error.message:"Could not save response");
    }finally{
      setSaving("");
    }
  };

  const quickLinks=[
    {label:"Sunday",copy:"Availability and run details",icon:"✓",view:"attendance"},
    {label:"My Player",copy:"Profile, Overall and career",icon:"◎",view:"my-player"},
    {label:"Around the League",copy:"Results, rankings and voting",icon:"▦",view:"community"},
    {label:"Hall & History",copy:"Records, awards and legacy",icon:"♛",view:"hof"},
  ];

  const navigateQuick=(view:string)=>{
    if(view==="my-player"){
      if(myPlayer)onOpenPlayer(myPlayer);
      else onChoosePlayer();
      return;
    }
    onNavigate(view);
  };

  return <div className="homeClean67"><style>{css}</style>
    <header className="homeCleanHeader">
      <div className="homeCleanIdentity">
        <img src="/ys-guys-logo.svg" alt="Y's Guys"/>
        <div><h1>Y'S GUYS</h1><p>THE LEAGUE IS ALIVE</p></div>
      </div>
      <div className="homeCleanActions">
        <button className="homeCleanAvatar" onClick={()=>myPlayer?onOpenPlayer(myPlayer):onChoosePlayer()} aria-label="My Player">
          {myPlayer?.photoUrl?<img src={myPlayer.photoUrl} alt={myPlayer.name}/>:initials(myPlayer?.name)}
        </button>
      </div>
    </header>

    <main className="homeCleanMain">
      <article className="homeSunday">
        <img className="homeWatermark" src="/ys-guys-logo.svg" alt=""/>
        <div className="homeSundayTop">
          <span>NEXT SUNDAY</span>
          <strong>{confirmed.length}<small> / {players.length} IN</small></strong>
        </div>
        <h2>{nextRun?formatDate(nextRun.date):"No Sunday scheduled"}</h2>
        {nextRun?<>
          <div className="homeMeta">
            <b>◷ {nextRun.startTime||"TBD"}</b>
            <b>◆ {nextRun.location||"Location TBD"}</b>
          </div>
          {nextRun.notes&&<p className="homeNote">{nextRun.notes}</p>}
          <div className="homeFaces">
            {confirmedPlayers.slice(0,8).map(player=>player.photoUrl
              ?<img key={player.id} src={player.photoUrl} alt={player.name}/>
              :<span key={player.id}>{initials(player.name)}</span>)}
            {confirmed.length>8&&<i>+{confirmed.length-8}</i>}
          </div>
          <div className="homeRsvp">
            <button disabled={!!saving} onClick={()=>submit("going")}>✓ {saving==="going"?"SAVING…":"I'M IN"}</button>
            <button disabled={!!saving} onClick={()=>submit("maybe")}>? {saving==="maybe"?"SAVING…":"MAYBE"}</button>
            <button disabled={!!saving} onClick={()=>submit("out")}>× {saving==="out"?"SAVING…":"I'M OUT"}</button>
          </div>
          <small className="homeResponse">{message||`${Math.max(0,players.length-responded)} players have not responded`}</small>
        </>:<p className="homeEmpty">The Commissioner can schedule the next run.</p>}
      </article>

      <article className="homeNews">
        <div className="homeSectionTitle"><b>WEEKLY NEWS</b><button onClick={()=>onNavigate("community")}>VIEW ALL →</button></div>
        {featuredStory?<>
          <button className="homeFeature" onClick={()=>onNavigate("community")} style={featuredStory.imageUrl?{
            backgroundImage:`linear-gradient(90deg,rgba(3,13,29,.96),rgba(3,13,29,.28)),url(${featuredStory.imageUrl})`
          }:undefined}>
            <span>{featuredStory.category||"TOP STORY"}</span>
            <h2>{featuredStory.headline}</h2>
            <p>{featuredStory.summary||""}</p>
          </button>
          {publishedNews.length>1&&<div className="homeNewsLinks">
            {publishedNews.slice(1,3).map(story=><button key={story.id} onClick={()=>onNavigate("community")}>
              <small>{story.category||"LEAGUE NEWS"}</small><b>{story.headline}</b><i>›</i>
            </button>)}
          </div>}
        </>:<div className="homeEmpty">No published story yet.</div>}
      </article>

      {activeVote&&<button className="homePoll" onClick={()=>onNavigate("voting")}>
        <span className="homePollIcon">🗳️</span>
        <div><small>LIVE LEAGUE POLL</small><h2>{activeVote.title||"League vote"}</h2>{activeVote.description&&<p>{activeVote.description}</p>}<b>{activeVote.votes?.length??0} recorded {(activeVote.votes?.length??0)===1?"vote":"votes"} · Tap to cast yours</b></div>
        <strong>VOTE NOW →</strong>
      </button>}

      <section className="homeQuick">
        <div className="homeSectionTitle"><b>QUICK ACCESS</b><span>EXPLORE THE LEAGUE</span></div>
        <div className="homeQuickGrid">
          {quickLinks.map(link=><button key={link.label} onClick={()=>navigateQuick(link.view)}>
            <i>{link.icon}</i><span><b>{link.label}</b><small>{link.copy}</small></span><strong>›</strong>
          </button>)}
        </div>
      </section>

      <article className="homePlayer">
        <div className="homeSectionTitle"><b>MY PLAYER</b><span>PERSONAL SNAPSHOT</span></div>
        {myPlayer?<button className="homePlayerInner" onClick={()=>onOpenPlayer(myPlayer)}>
          {myPlayer.photoUrl?<img src={myPlayer.photoUrl} alt={myPlayer.name}/>:<div>{initials(myPlayer.name)}</div>}
          <section><small>OVERALL</small><strong>{overall(myPlayer)}</strong><h3>{myPlayer.name}</h3></section>
          <div className="homePlayerStats">
            <span><b>{safeNumber(myPlayer.wins)}-{safeNumber(myPlayer.losses)}</b>RECORD</span>
            <span><b>{safeNumber(myPlayer.pts)}</b>PTS</span>
            <span><b>{safeNumber(myPlayer.reb)}</b>REB</span>
            <span><b>{safeNumber(myPlayer.ast)}</b>AST</span>
            <span><b>{defensiveTotal(myPlayer)}</b>STL+BLK</span>
          </div>
          <i>VIEW PROFILE →</i>
        </button>:<button className="homeChoose" onClick={onChoosePlayer}>CHOOSE MY PLAYER</button>}
      </article>
    </main>
  </div>;
}

const css=`
.homeClean67{display:grid;gap:16px;color:#f6f0df}
.homeClean67 button{font:inherit}
.homeCleanHeader{display:flex;justify-content:space-between;align-items:center;padding:2px 2px 8px}
.homeCleanIdentity{display:flex;align-items:center;gap:14px}
.homeCleanIdentity img{width:66px;height:66px;object-fit:contain;border:1px solid #d5b45b;border-radius:15px;padding:7px;background:#071a36}
.homeCleanIdentity h1{margin:0;color:white;font-size:clamp(27px,4vw,48px);font-style:italic;line-height:1}
.homeCleanIdentity p{margin:6px 0 0;color:#d5b45b;font-size:11px;font-weight:900;letter-spacing:.17em}
.homeCleanActions{display:flex;align-items:center;gap:10px}
.homeCleanActions>button{width:48px;height:48px;border:1px solid #8e7947;border-radius:50%;background:#071a36;color:white;font-weight:900}
.homeCleanActions>button:first-child:not(:last-child){background:#d5a93a;color:#07152d}
.homeCleanAvatar{overflow:hidden}
.homeCleanAvatar img{width:100%;height:100%;object-fit:cover}
.homeCleanMain{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(330px,1fr);gap:16px;align-items:start}
.homeSunday,.homeNews,.homeQuick,.homePlayer{border:1px solid rgba(213,180,91,.62);border-radius:20px;background:linear-gradient(145deg,#0b2a53,#06162f);box-shadow:0 16px 42px rgba(0,0,0,.25)}
.homeSunday{position:relative;overflow:hidden;padding:26px;min-height:430px}
.homeWatermark{position:absolute;right:-30px;bottom:-120px;width:440px;opacity:.055}
.homeSunday>*:not(.homeWatermark){position:relative}
.homeSundayTop{display:flex;justify-content:space-between;align-items:center}
.homeSundayTop>span,.homeFeature>span{background:linear-gradient(90deg,#d5a93a,#8d6718);color:#07152d;font-weight:1000;padding:7px 13px;border-radius:3px}
.homeSundayTop strong{color:#52d37d;font-size:30px}
.homeSundayTop small{color:#d8e0ea;font-size:12px;letter-spacing:.08em}
.homeSunday h2{font-size:clamp(36px,5vw,64px);font-style:italic;text-transform:uppercase;color:white;margin:20px 0 10px;line-height:.95}
.homeMeta{display:flex;flex-wrap:wrap;gap:22px;color:#e9edf3}
.homeNote{max-width:640px;color:#bbc7d6;margin:18px 0 0}
.homeFaces{display:flex;margin:22px 0 18px}
.homeFaces img,.homeFaces span{width:44px;height:44px;border-radius:50%;border:2px solid #d5b45b;margin-right:-6px;object-fit:cover;background:#12335d;display:grid;place-items:center;font-size:11px;font-weight:900}
.homeFaces i{margin-left:14px;width:44px;height:44px;border:1px solid #d5b45b;border-radius:50%;display:grid;place-items:center;font-style:normal}
.homeRsvp{display:grid;grid-template-columns:repeat(3,1fr);gap:11px;margin-top:18px}
.homeRsvp button{min-height:66px;border-radius:11px;color:white;font-weight:1000;font-size:17px;border:1px solid rgba(255,255,255,.2)}
.homeRsvp button:nth-child(1){background:linear-gradient(#19aa50,#08742f)}
.homeRsvp button:nth-child(2){background:linear-gradient(#e9a916,#ad6d00)}
.homeRsvp button:nth-child(3){background:linear-gradient(#d5202c,#850514)}
.homeRsvp button:disabled{opacity:.65}
.homeResponse{display:block;text-align:center;color:#cbd4e0;margin-top:13px;letter-spacing:.04em}
.homeNews{padding:18px;min-height:430px}
.homeSectionTitle{display:flex;justify-content:space-between;align-items:center;color:#d5b45b;gap:12px}
.homeSectionTitle button,.homeSectionTitle span{border:0;background:none;color:#d7dfeb;font-size:12px}
.homeFeature{width:100%;margin-top:14px;border:0;border-radius:14px;padding:20px;min-height:270px;background:linear-gradient(135deg,#123c68,#07162f);background-size:cover;background-position:center;display:flex;flex-direction:column;justify-content:flex-end;align-items:flex-start;text-align:left;color:white}
.homeFeature h2{font-size:clamp(25px,3vw,40px);line-height:1;text-transform:uppercase;font-style:italic;margin:14px 0 9px;color:white}
.homeFeature p{margin:0;color:#d4dce7;max-width:80%}
.homeNewsLinks{display:grid;gap:8px;margin-top:10px}
.homeNewsLinks button{display:grid;grid-template-columns:1fr auto;text-align:left;border:1px solid rgba(213,180,91,.25);background:rgba(255,255,255,.035);color:white;border-radius:11px;padding:11px}
.homeNewsLinks small{color:#d5b45b}
.homeNewsLinks b{grid-column:1}
.homeNewsLinks i{grid-column:2;grid-row:1/3;font-size:24px;color:#d5b45b}
.homePoll{grid-column:1/-1;width:100%;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:16px;padding:18px 20px;border:1px solid #d5b45b;border-radius:17px;background:linear-gradient(115deg,#d5a93a,#8d6718);color:#07152d;text-align:left;box-shadow:0 14px 32px rgba(0,0,0,.2)}
.homePollIcon{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#07152d;font-size:25px}
.homePoll div{min-width:0}.homePoll small{font-size:9px;font-weight:1000;letter-spacing:.14em}.homePoll h2{margin:3px 0;color:#07152d;font-size:clamp(19px,3vw,29px);line-height:1.08}.homePoll p{margin:4px 0;color:#24344b}.homePoll b{font-size:11px}.homePoll>strong{white-space:nowrap;color:#07152d}
.homeQuick{grid-column:1/-1;padding:20px}
.homeQuickGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:16px}
.homeQuickGrid button{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px;text-align:left;border:1px solid rgba(213,180,91,.28);border-radius:14px;background:rgba(255,255,255,.035);color:white;padding:17px;min-height:94px}
.homeQuickGrid button>i{width:43px;height:43px;border-radius:50%;display:grid;place-items:center;background:#d5a93a;color:#07152d;font-style:normal;font-size:22px;font-weight:900}
.homeQuickGrid span{display:grid;gap:4px}
.homeQuickGrid small{color:#9eafc2;line-height:1.25}
.homeQuickGrid strong{color:#d5b45b;font-size:24px}
.homePlayer{grid-column:1/-1;padding:20px}
.homePlayerInner{width:100%;display:grid;grid-template-columns:auto auto 1fr auto;align-items:center;gap:20px;border:0;background:transparent;color:white;text-align:left;padding:14px 0 0}
.homePlayerInner>img,.homePlayerInner>div:first-child{width:88px;height:88px;border-radius:50%;border:2px solid #d5b45b;object-fit:cover;background:#12335d;display:grid;place-items:center;font-weight:900}
.homePlayerInner section small{color:#9eafc2}
.homePlayerInner section strong{display:block;color:white;font-size:42px;line-height:1}
.homePlayerInner section h3{margin:5px 0 0}
.homePlayerStats{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.homePlayerStats span{text-align:center;color:#9eafc2;font-size:10px;letter-spacing:.06em}
.homePlayerStats b{display:block;color:white;font-size:19px}
.homePlayerInner>i{font-style:normal;color:#d5b45b;font-weight:900}
.homeChoose{margin-top:16px;width:100%;min-height:64px;border:1px solid #d5b45b;border-radius:12px;background:#d5a93a;color:#07152d;font-weight:1000}
.homeEmpty{min-height:150px;display:grid;place-items:center;color:#aab7c8;text-align:center}
@media(max-width:980px){
  .homeCleanMain{grid-template-columns:1fr}
  .homeQuick,.homePlayer,.homePoll{grid-column:auto}
  .homeQuickGrid{grid-template-columns:repeat(2,1fr)}
}
@media(max-width:640px){
  .homeClean67{gap:12px}
  .homeCleanHeader{padding:0 0 5px}
  .homeCleanIdentity img{width:48px;height:48px;border-radius:12px}
  .homeCleanIdentity h1{font-size:21px}
  .homeCleanIdentity p{font-size:8px}
  .homeCleanActions>button{width:44px;height:44px}
  .homeSunday,.homeNews,.homeQuick,.homePlayer{border-radius:17px}
  .homeSunday{padding:19px;min-height:0}
  .homeSundayTop strong{font-size:23px}
  .homeSunday h2{font-size:35px;margin-top:17px}
  .homeMeta{display:grid;gap:8px}
  .homeRsvp{gap:7px}
  .homeRsvp button{min-height:58px;font-size:13px;padding:7px 3px}
  .homeNews{min-height:0;padding:16px}
  .homePoll{grid-template-columns:auto 1fr;padding:14px}.homePollIcon{width:44px;height:44px;font-size:20px}.homePoll>strong{grid-column:1/-1;text-align:center;border-top:1px solid rgba(7,21,45,.2);padding-top:9px}.homePoll p{display:none}
  .homeFeature{min-height:250px}
  .homeFeature p{max-width:100%}
  .homeQuick{padding:16px}
  .homeQuickGrid{grid-template-columns:1fr;gap:9px}
  .homeQuickGrid button{min-height:78px;padding:13px}
  .homePlayer{padding:16px}
  .homePlayerInner{grid-template-columns:auto 1fr;gap:14px}
  .homePlayerInner>img,.homePlayerInner>div:first-child{width:72px;height:72px}
  .homePlayerStats{grid-column:1/-1}
  .homePlayerInner>i{grid-column:1/-1;text-align:center;margin-top:4px}
}
`;
