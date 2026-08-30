import type { Plugin } from "vite";

// Device identity is local-only; switching never mutates shared league records.

function replaceRequired(source:string,search:string,replacement:string){
  if(!source.includes(search))throw new Error(`Switch Player patch could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

function replaceSection(source:string,start:string,end:string,replacement:string){
  const from=source.indexOf(start);
  const to=source.indexOf(end,from);
  if(from<0||to<0)throw new Error(`Switch Player patch could not locate ${start}`);
  return source.slice(0,from)+replacement+source.slice(to);
}

export function version76SwitchPlayer():Plugin{
  return {
    name:"ys-guys-version-76-switch-player",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      let code=source;

      code=replaceRequired(code,
        'const chooseMyPlayer=(id:string)=>{setMyPlayerId(id);if(id)localStorage.setItem("yg-my-player",id);else localStorage.removeItem("yg-my-player");};',
        'const chooseMyPlayer=(id:string)=>{setMyPlayerId(id);if(id){localStorage.setItem("yg-my-player",id);localStorage.setItem("yg-player-ever-claimed","1");}else localStorage.removeItem("yg-my-player");};'
      );

      code=replaceRequired(code,
        '<button className="myPlayerPill" onClick={()=>myPlayer?openProfile(myPlayer):setShowMyPlayerPicker(true)}>',
        '<button className="myPlayerPill" onClick={()=>setShowMyPlayerPicker(true)} aria-label={myPlayer?`Switch player. Currently ${myPlayer.name}`:"Choose My Player"} title={myPlayer?"Switch Player":"Choose My Player"}>'
      );

      code=replaceRequired(code,
        '{showMyPlayerPicker&&<MyPlayerPicker players={players} selectedId={myPlayerId} onSelect={(id)=>{chooseMyPlayer(id);setShowMyPlayerPicker(false)}} onClose={()=>setShowMyPlayerPicker(false)}/>}',
        '{showMyPlayerPicker&&<MyPlayerPicker players={players} selectedId={myPlayerId} onSelect={(id)=>{chooseMyPlayer(id);if(id)setShowMyPlayerPicker(false)}} onClose={()=>setShowMyPlayerPicker(false)}/>}'
      );

      code=replaceRequired(code,
        '<div className="menuList">',
        '<div className="menuList"><Menu label="Switch My Player" icon="⇄" onClick={()=>setShowMyPlayerPicker(true)}/>'
      );

      const picker=`function MyPlayerPicker({players,selectedId,onSelect,onClose}:{players:Player[];selectedId:string;onSelect:(id:string)=>void;onClose:()=>void}){
  const [query,setQuery]=useState("");
  const current=players.find(player=>player.id===selectedId);
  const visible=players.filter(player=>\`${'${player.name} ${player.nickname}'}\`.toLowerCase().includes(query.trim().toLowerCase()));
  const selectPlayer=(player:Player)=>{
    if(current&&current.id!==player.id&&!confirm(\`Switch this device from ${'${current.name}'} to ${'${player.name}'}? Your stats and profiles will not be changed.\`))return;
    onSelect(player.id);
  };
  return <div className="modalBackdrop" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}><section className="myPlayerPicker" role="dialog" aria-modal="true" aria-labelledby="my-player-title"><button className="close" onClick={onClose} aria-label="Close">×</button><span>{current?"DEVICE PLAYER":"CLAIM YOUR PLAYER"}</span><h2 id="my-player-title">{current?"Switch Player":"Choose My Player"}</h2>{current?<div className="identityCurrent">{current.photoUrl?<img src={current.photoUrl} alt=""/>:<span className="avatar">{initials(current.name)}</span>}<div><small>THIS DEVICE IS CURRENTLY USING</small><b>{current.name}</b><p>If this isn’t you, choose your own profile below.</p></div></div>:<p>Choose your existing profile. This only connects this device and does not change anyone’s stats.</p>}<input className="playerSwitchSearch" value={query} onChange={event=>setQuery(event.target.value)} placeholder="Search name or nickname…" aria-label="Search players"/><div>{visible.map(player=>{const rating=overallRating(player,players);return <button className={selectedId===player.id?"selected":""} onClick={()=>selectPlayer(player)} key={player.id}>{player.photoUrl?<img src={player.photoUrl} alt=""/>:<span className="avatar">{initials(player.name)}</span>}<b>{player.name}</b><small>{player.nickname} · {rating??"PROV"}{rating===null?"":" OVR"}</small>{selectedId===player.id&&<strong>CURRENT</strong>}</button>})}{!visible.length&&<p className="playerSwitchEmpty">No matching player found.</p>}</div>{current&&<button className="logoutPlayer" onClick={()=>onSelect("")}>This isn’t me — log out of {current.name}</button>}<small className="identitySafety">Changing My Player affects only this device. No profile, stats, votes, or history are deleted.</small></section></div>;
}

`;
      code=replaceSection(code,"function MyPlayerPicker(","function ManageList(",picker);

      code=replaceRequired(code,'const styles = `\n',`const styles = \`\n.identityCurrent{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;padding:12px;margin:0 0 14px;border:1px solid #dfc77f;border-radius:15px;background:#fff9e8}.identityCurrent>img,.identityCurrent>.avatar{width:52px;height:52px;border-radius:14px;object-fit:cover}.identityCurrent>div{display:grid;gap:2px}.identityCurrent small{font-size:8px;letter-spacing:.12em;color:#927022;font-weight:1000}.identityCurrent b{font-size:18px}.identityCurrent p{margin:0!important;font-size:12px!important}.playerSwitchSearch{width:100%;padding:12px 14px;margin:0 0 12px;border:1px solid #dbe1e9;border-radius:12px;font:inherit;color:\${NAVY};background:white}.logoutPlayer{width:100%;margin-top:14px;padding:12px;border:1px solid #d87b7b;border-radius:12px;background:#fff1f1;color:#9b2929;font-weight:900}.identitySafety{display:block;margin-top:10px;color:#718096;line-height:1.4}.playerSwitchEmpty{grid-column:1/-1;text-align:center;color:#718096}\n`);
      return {code,map:null};
    }
  };
}
