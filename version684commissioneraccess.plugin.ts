import type { Plugin } from "vite";

function replaceRequired(source:string, search:string, replacement:string){
  if(!source.includes(search)) throw new Error(`Commissioner access patch could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

export function version684CommissionerAccess():Plugin{
  return {
    name:"ys-guys-version-684-commissioner-access",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx")) return null;
      let code=source;
      code=replaceRequired(
        code,
        '<div className="headerActions"><button className="myPlayerPill" onClick={()=>myPlayer?openProfile(myPlayer):setShowMyPlayerPicker(true)}>{myPlayer?<>{myPlayer.photoUrl?<img className="avatar photoAvatar" src={myPlayer.photoUrl} alt=""/>:<span className="avatar">{initials(myPlayer.name)}</span>}<b>{myPlayer.name}</b></>:<>◎ <b>My Player</b></>}</button><button className="seasonPill" onClick={()=>go("hof")}><span className={`syncDot ${cloudStatus}`}/>{cloudStatus==="cloud"?"Shared":"Offline"} · Summer 2026</button></div>',
        '<div className="headerActions"><button className="myPlayerPill" onClick={()=>myPlayer?openProfile(myPlayer):setShowMyPlayerPicker(true)}>{myPlayer?<>{myPlayer.photoUrl?<img className="avatar photoAvatar" src={myPlayer.photoUrl} alt=""/>:<span className="avatar">{initials(myPlayer.name)}</span>}<b>{myPlayer.name}</b></>:<>◎ <b>My Player</b></>}</button><button className={`commissionerAccess ${sessionToken?"unlocked":""}`} onClick={()=>go("commissioner")} aria-label="Commissioner Mode" title="Commissioner Mode"><span>♛</span><b>Commissioner</b></button><button className="seasonPill" onClick={()=>go("hof")}><span className={`syncDot ${cloudStatus}`}/>{cloudStatus==="cloud"?"Shared":"Offline"} · Summer 2026</button></div>'
      );
      code=replaceRequired(
        code,
        '.headerActions{display:flex;align-items:center;gap:8px}.myPlayerPill',
        '.headerActions{display:flex;align-items:center;gap:8px}.commissionerAccess{border:1px solid #d7b65b;background:#0a2d5e;color:#f3d578;padding:8px 11px;border-radius:999px;display:flex;align-items:center;gap:6px;font-weight:900}.commissionerAccess.unlocked{background:#c7a24d;color:#071f42}.commissionerAccess span{font-size:15px}.commissionerAccess b{font-size:11px}.myPlayerPill'
      );
      code=replaceRequired(
        code,
        '@media(max-width:640px){.formGrid,.rsvpFields{grid-template-columns:1fr}',
        '@media(max-width:640px){.commissionerAccess{width:40px;height:40px;padding:0;justify-content:center;border-radius:50%}.commissionerAccess b{display:none}.formGrid,.rsvpFields{grid-template-columns:1fr}'
      );
      return {code,map:null};
    }
  };
}
