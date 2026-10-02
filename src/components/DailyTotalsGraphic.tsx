import React from 'react';

export type DailyTotalsRow = {
  player: string; gp: number; wl: string; pts: number; reb: number;
  ast: number; turnovers: number; stocks: number;
};

export type DailyTotalsData = {
  season: number; week: number; date: string; day: string;
  rows: DailyTotalsRow[];
};

const sample: DailyTotalsData = {
  season: 2, week: 11, date: 'SEPTEMBER 27, 2026', day: 'SUNDAY',
  rows: [
    {player:'Paul',gp:11,wl:'6-5',pts:45,reb:31,ast:10,turnovers:1,stocks:4},
    {player:'Ty',gp:11,wl:'6-5',pts:31,reb:45,ast:18,turnovers:9,stocks:0},
    {player:'Nick P',gp:10,wl:'6-4',pts:31,reb:24,ast:10,turnovers:1,stocks:3},
    {player:'Hunter',gp:9,wl:'5-4',pts:15,reb:3,ast:8,turnovers:1,stocks:1},
    {player:'Nick D',gp:9,wl:'5-4',pts:9,reb:20,ast:14,turnovers:1,stocks:7},
    {player:'Steve',gp:9,wl:'6-3',pts:35,reb:23,ast:7,turnovers:6,stocks:1},
    {player:'Vic',gp:9,wl:'5-4',pts:55,reb:37,ast:4,turnovers:2,stocks:9},
    {player:'Jeffrey',gp:8,wl:'3-5',pts:28,reb:36,ast:13,turnovers:8,stocks:1},
    {player:'Jose',gp:6,wl:'3-3',pts:16,reb:20,ast:6,turnovers:1,stocks:0},
    {player:'Mario',gp:5,wl:'1-4',pts:2,reb:15,ast:3,turnovers:3,stocks:3},
    {player:'Anwar',gp:5,wl:'1-4',pts:25,reb:29,ast:6,turnovers:1,stocks:2},
    {player:'Mo',gp:4,wl:'1-3',pts:6,reb:8,ast:8,turnovers:0,stocks:3},
  ]
};

function leader(rows: DailyTotalsRow[], key: 'pts'|'reb'|'ast'|'stocks', low=false) {
  if (!rows.length) return {player:'—', value:0};
  const sorted=[...rows].sort((a,b)=> low ? (a[key] as number)-(b[key] as number) : (b[key] as number)-(a[key] as number));
  return {player:sorted[0].player, value:sorted[0][key] as number};
}
function turnoverLeader(rows: DailyTotalsRow[]) {
  if (!rows.length) return {player:'—',value:0};
  const x=[...rows].sort((a,b)=>a.turnovers-b.turnovers)[0];
  return {player:x.player,value:x.turnovers};
}

export default function DailyTotalsGraphic({data=sample}:{data?:DailyTotalsData}) {
  const leaders=[
    ['POINTS',leader(data.rows,'pts')],['REBOUNDS',leader(data.rows,'reb')],
    ['ASSISTS',leader(data.rows,'ast')],['STEALS + BLOCKS',leader(data.rows,'stocks')],
    ['LOWEST TURNOVERS',turnoverLeader(data.rows)]
  ] as const;
  return <div className="yg-daily">
    <div className="yg-corner tl"/><div className="yg-corner tr"/><div className="yg-corner bl"/><div className="yg-corner br"/>
    <header><div className="yg-mark">Y</div><h1>DAILY STATS</h1></header>
    <div className="yg-rule"/>
    <div className="yg-meta"><span>SEASON {data.season}</span><i/><span>WEEK {data.week}</span><i/><span>{data.date}</span><i/><span className="cal">▣</span><span>{data.day}</span></div>
    <main>
      <table><thead><tr>{['PLAYER','GP','W-L','PTS','REB','AST','TO','STL+BLK'].map(x=><th key={x}>{x}</th>)}</tr></thead>
      <tbody>{data.rows.map(r=><tr key={r.player}><td>{r.player}</td><td>{r.gp}</td><td>{r.wl}</td><td>{r.pts}</td><td>{r.reb}</td><td>{r.ast}</td><td>{r.turnovers}</td><td>{r.stocks}</td></tr>)}</tbody></table>
      <aside><div className="leader-title">★ &nbsp; TOP PLAYERS &nbsp; ★</div>{leaders.map(([label,x])=><div className="leader" key={label}><div className="leader-mark">Y</div><div><b>{label}</b><strong>{x.value}</strong><span>{x.player.toUpperCase()}</span></div></div>)}</aside>
    </main>
    <footer>Y’S GUYS OFFICIAL STATISTICAL REPORT <span>ANY COURT<br/>ANY DAY</span></footer>
    <style>{`
      .yg-daily{--navy:#062f5e;--blue:#162a78;--gold:#bd8409;--cream:#faf8ef;--grid:#9babb8;box-sizing:border-box;position:relative;width:1408px;height:1056px;padding:24px 28px 22px;background:var(--cream);color:var(--blue);font-family:Arial Narrow,Arial,sans-serif;overflow:hidden;border:3px solid var(--gold)}
      .yg-daily:before,.yg-daily:after{content:'';position:absolute;inset:9px;border:1px solid var(--gold);pointer-events:none}.yg-daily:after{inset:15px;border-color:#d7b967}
      .yg-corner{position:absolute;width:54px;height:54px;border-color:var(--gold);z-index:2}.tl{left:7px;top:7px;border-left:3px solid;border-top:3px solid}.tr{right:7px;top:7px;border-right:3px solid;border-top:3px solid}.bl{left:7px;bottom:7px;border-left:3px solid;border-bottom:3px solid}.br{right:7px;bottom:7px;border-right:3px solid;border-bottom:3px solid}
      .yg-daily header{height:126px;display:flex;align-items:center;justify-content:center;gap:42px}.yg-mark{font-family:Georgia,serif;font-size:92px;font-weight:900;color:var(--navy);line-height:1}.yg-daily h1{font-family:Georgia,serif;font-size:74px;letter-spacing:3px;margin:0;color:var(--navy)}
      .yg-rule{height:1px;background:#b9c3c9;margin:0 170px}.yg-meta{height:58px;display:flex;align-items:center;justify-content:center;gap:25px;font-weight:800;font-size:24px}.yg-meta i{height:32px;width:2px;background:var(--blue)}.yg-meta .cal{font-size:22px;margin-right:-15px}
      .yg-daily main{display:grid;grid-template-columns:984px 354px;gap:14px}.yg-daily table{width:100%;border-collapse:collapse;table-layout:fixed;font-size:25px}.yg-daily th{height:47px;background:var(--navy);color:var(--gold);font-size:21px}.yg-daily td{height:55px;border:1px solid var(--grid);text-align:center;font-weight:800}.yg-daily td:first-child{text-align:left;padding-left:20px;width:155px}.yg-daily th:first-child{width:155px}.yg-daily th:last-child{width:136px}
      .yg-daily aside{border:2px solid var(--navy);border-radius:12px;overflow:hidden}.leader-title{height:46px;background:var(--navy);color:var(--gold);font-size:23px;font-weight:900;display:flex;align-items:center;justify-content:center}.leader{height:132px;margin:0 12px;border-bottom:2px solid #aab7c0;display:grid;grid-template-columns:105px 1fr;align-items:center}.leader:last-child{border-bottom:0}.leader-mark{width:78px;height:78px;border:2px solid var(--blue);border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Georgia,serif;font-size:48px;font-weight:900;color:var(--navy)}.leader>div:last-child{text-align:center}.leader b,.leader span{display:block;font-size:18px}.leader strong{display:block;color:var(--gold);font-size:52px;line-height:1.05}.leader span{font-weight:900;font-size:21px}
      .yg-daily footer{height:48px;display:flex;align-items:end;justify-content:center;font-family:Georgia,serif;font-weight:800;font-size:17px;letter-spacing:1px}.yg-daily footer span{position:absolute;right:54px;bottom:31px;font-family:Arial,sans-serif;font-size:10px;text-align:center;line-height:1.1}
    `}</style>
  </div>;
}
