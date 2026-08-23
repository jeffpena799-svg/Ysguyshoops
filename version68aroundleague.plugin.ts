import type { Plugin } from "vite";

export function version68AroundLeague():Plugin{
  return {
    name:"ys-guys-version-68-around-league",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      let code=source;
      if(!code.includes('import AroundLeague from "./components/AroundLeague";')){
        code=code.replace('import React, { useEffect, useMemo, useState } from "react";','import React, { useEffect, useMemo, useState } from "react";\nimport AroundLeague from "./components/AroundLeague";');
      }
      const communityPattern=/\{view==="community" && <Page[\s\S]*?<\/Page>\}/;
      if(!communityPattern.test(code))throw new Error("Version 6.8 could not find the Around the League community view");
      code=code.replace(communityPattern,'{view==="community" && <AroundLeague players={players} snapshot={latestRanking} onOpen={openProfile} getOverall={(player)=>overallRating(player,players)}/>}');
      const styleAnchor='const styles = `';
      if(!code.includes(styleAnchor))throw new Error("Version 6.8 could not find app styles");
      const css=`
.atlPage{max-width:1180px;margin:0 auto;padding:24px 20px 120px;color:#142033}
.atlBroadcast{display:grid;gap:16px}
.atlBroadcast button{font:inherit}
.atlBroadcastHead{position:relative;overflow:hidden;display:grid;grid-template-columns:1fr auto;align-items:end;gap:24px;min-height:245px;padding:34px;border:1px solid #31547e;border-radius:26px;background:radial-gradient(circle at 80% 15%,rgba(213,169,58,.2),transparent 28%),linear-gradient(135deg,#06162f,#0a2d5e 68%,#123f75);color:white;box-shadow:0 20px 48px rgba(6,22,47,.25)}
.atlBroadcastHead:after{content:"YG";position:absolute;right:155px;bottom:-62px;color:rgba(255,255,255,.035);font-size:220px;font-weight:1000;font-style:italic;line-height:1}
.atlBroadcastHead>div,.atlBroadcastHead>aside{position:relative;z-index:1}
.atlBroadcastHead>div>span{display:inline-flex;align-items:center;gap:7px;color:#d8bc74;font-size:10px;font-weight:1000;letter-spacing:.16em}
.atlBroadcastHead>div>span i{width:8px;height:8px;border-radius:50%;background:#4cda7c;box-shadow:0 0 0 5px rgba(76,218,124,.12)}
.atlBroadcastHead h1{margin:10px 0 8px;color:white;font-size:clamp(42px,7vw,78px);font-style:italic;text-transform:uppercase;line-height:.9;letter-spacing:-.04em}
.atlBroadcastHead p{margin:0;color:#c7d3e1;font-size:16px}
.atlBroadcastHead aside{min-width:145px;padding:18px;border-left:4px solid #d5a93a;background:rgba(255,255,255,.07);text-align:center}
.atlBroadcastHead aside small,.atlBroadcastHead aside span{display:block;color:#d8bc74;font-size:9px;font-weight:1000;letter-spacing:.12em}
.atlBroadcastHead aside b{display:block;margin:4px 0;color:white;font-size:52px;line-height:1}
.atlTabs{position:sticky;top:76px;z-index:8;display:grid;grid-template-columns:repeat(3,1fr);overflow:hidden;border:1px solid #d9dfe7;border-radius:16px;background:white;box-shadow:0 10px 25px rgba(13,34,61,.08)}
.atlTabs button{position:relative;display:grid;gap:2px;min-height:70px;padding:12px;border:0;border-right:1px solid #e4e8ee;background:white;color:#687589;text-align:left}
.atlTabs button:last-child{border-right:0}
.atlTabs button small{font-size:8px;font-weight:1000;letter-spacing:.13em;color:#9a7628}
.atlTabs button b{font-size:15px}
.atlTabs button.active{background:#0a2d5e;color:white}
.atlTabs button.active:after{content:"";position:absolute;left:0;right:0;bottom:0;height:4px;background:#d5a93a}
.atlTabs button.active small{color:#e2c77f}
.atlTabPanel{display:grid;gap:16px}
.atlTopRank{position:relative;display:grid;grid-template-columns:260px minmax(0,1fr) auto;align-items:stretch;overflow:hidden;min-height:270px;padding:0;border:1px solid #d1b35e;border-radius:24px;background:linear-gradient(115deg,#081c3a,#0a2d5e 62%,#174775);color:white;text-align:left;box-shadow:0 16px 38px rgba(10,45,94,.18)}
.atlTopRank:disabled{cursor:default}
.atlTopPortrait{position:relative;min-height:270px;background:linear-gradient(145deg,#173f69,#07162f)}
.atlTopPortrait img{width:100%;height:100%;object-fit:cover}
.atlTopPortrait>span{width:100%;height:100%;display:grid;place-items:center;color:#d8bc74;font-size:74px;font-weight:1000}
.atlTopPortrait strong{position:absolute;left:16px;bottom:16px;padding:8px 12px;border-radius:9px;background:#d5a93a;color:#07162f;font-size:28px;font-style:italic}
.atlTopCopy{align-self:center;padding:30px}
.atlTopCopy>small,.atlBoardHeader small{color:#d5a93a;font-size:9px;font-weight:1000;letter-spacing:.14em}
.atlTopCopy h2{margin:6px 0;color:white;font-size:clamp(34px,5vw,58px);font-style:italic;text-transform:uppercase;line-height:1}
.atlTopCopy p{max-width:610px;margin:8px 0 20px;color:#c5d1df;line-height:1.45}
.atlTopCopy>div{display:flex;gap:9px;flex-wrap:wrap}
.atlTopCopy>div b{min-width:95px;padding:10px 13px;border:1px solid rgba(255,255,255,.16);border-radius:10px;background:rgba(255,255,255,.06);font-size:20px;text-align:center}
.atlTopCopy>div small{display:block;margin-top:3px;color:#d8bc74;font-size:8px;letter-spacing:.1em}
.atlTopRank>span{align-self:start;margin:18px;padding:8px 11px;border-radius:999px;background:rgba(255,255,255,.1);font-size:11px;font-weight:1000}
.atlTopRank .up,.atlRankRow .up{color:#5cdf88}.atlTopRank .down,.atlRankRow .down{color:#ff8181}.atlTopRank .flat,.atlRankRow .flat{color:#bec9d7}
.atlBoardHeader{display:flex;align-items:end;justify-content:space-between;gap:12px;padding:16px 4px 0}
.atlBoardHeader h2{margin:3px 0 0;color:#142033;font-size:28px}
.atlBoardHeader>span{color:#7a8595;font-size:11px}
.atlRankings{display:grid;gap:8px}
.atlRankRow{width:100%;display:grid;grid-template-columns:54px 48px minmax(0,1fr) 62px 54px 58px;gap:11px;align-items:center;border:1px solid #dfe5ec;border-radius:14px;background:white;padding:11px 14px;color:#142033;text-align:left;box-shadow:0 7px 18px rgba(13,34,61,.045)}
.atlRankRow:hover{border-color:#c5a850;transform:translateY(-1px)}
.atlRankRow>strong{font-size:23px;font-style:italic}
.atlRankRow img,.atlAvatar{width:44px;height:44px;border-radius:50%;object-fit:cover}
.atlAvatar{display:grid;place-items:center;background:#0a2d5e;color:white;font-size:11px;font-weight:1000}
.atlRankRow>div{display:grid;min-width:0}
.atlRankRow>div b{font-size:15px}
.atlRankRow>div small{overflow:hidden;color:#748095;font-size:11px;text-overflow:ellipsis;white-space:nowrap}
.atlRankRow>span{display:grid;text-align:center;font-weight:1000}
.atlRankRow>span small{color:#8a94a2;font-size:7px;letter-spacing:.1em}
.atlRankRow em{font-style:normal;font-size:10px;font-weight:1000;text-align:center}
.atlLeaderStrip{display:grid;grid-template-columns:repeat(4,1fr);gap:11px}
.atlLeaderStrip button{position:relative;overflow:hidden;display:grid;min-height:150px;padding:18px;border:1px solid #c8b16c;border-radius:18px;background:linear-gradient(145deg,#0a2d5e,#071b39);color:white;text-align:left}
.atlLeaderStrip button:after{content:"";position:absolute;right:-25px;bottom:-35px;width:110px;height:110px;border:18px solid rgba(213,169,58,.08);border-radius:50%}
.atlLeaderStrip small{color:#d8bc74;font-size:9px;font-weight:1000;letter-spacing:.12em}
.atlLeaderStrip strong{align-self:end;color:white;font-size:43px;line-height:1}
.atlLeaderStrip span{color:#cbd6e3;font-size:13px;font-weight:900}
.atlTableTitle{margin-top:5px}
.atlTableWrap{overflow-x:auto;border:1px solid #dfe5ec;border-radius:18px;background:white;box-shadow:0 10px 28px rgba(13,34,61,.06)}
.atlTable{width:100%;min-width:760px;border-collapse:collapse;table-layout:fixed}
.atlTable th,.atlTable td{padding:13px 8px;border-bottom:1px solid #edf0f4;color:#142033;text-align:center;white-space:nowrap}
.atlTable th:first-child,.atlTable td:first-child{width:36%;text-align:left}
.atlTable th:not(:first-child),.atlTable td:not(:first-child){width:10.66%}
.atlTable th{background:#0a2d5e;color:white}
.atlTable th button{border:0;background:none;color:white;font-size:11px;font-weight:1000}
.atlTable tbody tr{cursor:pointer}
.atlTable tbody tr:hover{background:#faf7ed}
.atlTable td>span{display:flex;align-items:center;gap:8px;min-width:0}
.atlTable td>span>em{width:18px;color:#9a7628;font-size:10px;font-style:normal;font-weight:1000}
.atlTable td>span b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.atlTable td img,.atlTable td i{width:32px;height:32px;border-radius:50%;object-fit:cover;flex:0 0 auto}
.atlTable td i{display:grid;place-items:center;background:#0a2d5e;color:white;font-size:9px;font-style:normal;font-weight:1000}
.atlPlayersTitle{align-items:center;padding-top:14px}
.atlPlayersTitle input{width:min(270px,48vw);border:1px solid #d9e0e8;border-radius:11px;padding:11px 13px;background:white;color:#142033;font:inherit}
.atlPlayerGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.atlPlayerCard{overflow:hidden;border:1px solid #dfe5ec;border-radius:20px;background:white;padding:0;color:#142033;text-align:left;box-shadow:0 10px 25px rgba(13,34,61,.06)}
.atlPlayerHero{display:grid;grid-template-columns:78px minmax(0,1fr) auto;align-items:center;gap:13px;padding:17px;background:linear-gradient(135deg,#071b39,#0a2d5e);color:white}
.atlPlayerHero>img,.atlPlayerHero>span{width:70px;height:70px;border-radius:17px;object-fit:cover}
.atlPlayerHero>span{display:grid;place-items:center;background:#ede1bf;color:#0a2d5e;font-weight:1000}
.atlPlayerHero h3{margin:3px 0;color:white;font-size:20px}
.atlPlayerHero p{margin:0;color:#ccd7e4;font-size:12px}
.atlPlayerHero div small{color:#d8bc74;font-size:8px;font-weight:1000;letter-spacing:.1em}
.atlPlayerHero>strong{display:grid;color:white;font-size:27px;text-align:center}
.atlPlayerHero>strong small{color:#d8bc74;font-size:7px;letter-spacing:.12em}
.atlPlayerStats{display:grid;grid-template-columns:repeat(4,1fr);padding:14px 9px}
.atlPlayerStats span{display:grid;border-right:1px solid #edf0f4;text-align:center}
.atlPlayerStats span:last-child{border:0}
.atlPlayerStats b{font-size:17px}
.atlPlayerStats small{color:#7c8796;font-size:7px;letter-spacing:.08em}
.atlPlayerCard footer{display:flex;justify-content:space-between;padding:11px 14px;border-top:1px solid #edf0f4;color:#0a2d5e;font-size:10px;font-weight:1000;letter-spacing:.06em}
.atlPlayerCard footer i{font-style:normal}
@media(max-width:720px){
  .atlPage{padding:13px 12px 105px;gap:11px}
  .atlBroadcastHead{grid-template-columns:1fr;min-height:210px;padding:24px 20px}
  .atlBroadcastHead:after{right:-25px;font-size:160px}
  .atlBroadcastHead aside{display:none}
  .atlBroadcastHead h1{font-size:44px}
  .atlBroadcastHead p{font-size:13px}
  .atlTabs{top:68px}
  .atlTabs button{min-height:61px;padding:9px 10px;text-align:center}
  .atlTabs button small{font-size:7px}
  .atlTabs button b{font-size:12px}
  .atlTopRank{grid-template-columns:115px minmax(0,1fr);min-height:220px}
  .atlTopPortrait{min-height:220px}
  .atlTopPortrait strong{left:8px;bottom:8px;font-size:20px}
  .atlTopCopy{padding:18px 14px}
  .atlTopCopy h2{font-size:29px}
  .atlTopCopy p{display:-webkit-box;overflow:hidden;margin:7px 0 13px;font-size:11px;-webkit-line-clamp:3;-webkit-box-orient:vertical}
  .atlTopCopy>div{gap:5px}
  .atlTopCopy>div b{min-width:0;padding:7px;font-size:14px}
  .atlTopRank>span{position:absolute;right:5px;top:4px;margin:7px;font-size:8px}
  .atlBoardHeader{align-items:start;padding-top:10px}
  .atlBoardHeader h2{font-size:23px}
  .atlBoardHeader>span{max-width:130px;text-align:right}
  .atlRankRow{grid-template-columns:38px 39px minmax(0,1fr) 44px 45px;padding:9px 8px;gap:7px}
  .atlRankRow>strong{font-size:17px}
  .atlRankRow img,.atlAvatar{width:37px;height:37px}
  .atlRankRow>div small{font-size:9px}
  .atlRankRecord{display:none!important}
  .atlRankRow em{font-size:8px}
  .atlLeaderStrip{grid-template-columns:repeat(2,1fr);gap:8px}
  .atlLeaderStrip button{min-height:120px;padding:14px}
  .atlLeaderStrip strong{font-size:35px}
  .atlTable th,.atlTable td{padding:11px 5px;font-size:12px}
  .atlPlayerGrid{grid-template-columns:1fr}
  .atlPlayersTitle{align-items:flex-start;flex-direction:column}
  .atlPlayersTitle input{width:100%}
  .atlPlayerHero{grid-template-columns:66px minmax(0,1fr) auto;padding:14px}
  .atlPlayerHero>img,.atlPlayerHero>span{width:60px;height:60px}
  .atlPlayerStats b{font-size:15px}
}
`;
      code=code.replace(styleAnchor,styleAnchor+css);
      return {code,map:null};
    }
  };
}
