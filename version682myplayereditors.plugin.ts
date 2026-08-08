import type { Plugin } from "vite";

function replaceRequired(source:string, search:string, replacement:string){
  if(!source.includes(search)) throw new Error(`My Player compact editors patch could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

export function version682MyPlayerEditors():Plugin{
  return {
    name:"ys-guys-version-682-my-player-compact-editors",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx")) return null;
      let code=source;

      code=replaceRequired(
        code,
        '  {isMyPlayer&&<><PositionEditor player={player} onChange={onPositionChange}/><PhotoSubmission player={player} onSave={onPhotoSave}/></>}\n',
        ''
      );

      code=replaceRequired(
        code,
        '  <CareerBestSection sessions={playerSessions}/></>;\n}',
        `  <CareerBestSection sessions={playerSessions}/>
  {isMyPlayer&&<><style>{\`
.compactProfileEditors{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:14px}
.compactProfileEditors .profilePanel{margin:0!important;padding:12px!important;border-radius:15px!important;min-height:0!important}
.compactProfileEditors .sectionTitle{margin:0 0 8px!important;display:block!important}
.compactProfileEditors .sectionTitle span{font-size:8px!important;letter-spacing:.12em!important}
.compactProfileEditors .sectionTitle h2{font-size:15px!important;line-height:1.05!important;margin:3px 0 0!important}
.compactProfileEditors .positionEditor>p,.compactProfileEditors .photoSubmit>p{display:none!important}
.compactProfileEditors .positionEditor>div{display:grid!important;grid-template-columns:1fr!important;gap:6px!important}
.compactProfileEditors select{width:100%!important;min-height:36px!important;padding:6px 8px!important;border-radius:9px!important;font-size:13px!important}
.compactProfileEditors .primary,.compactProfileEditors .uploadButton{width:100%!important;min-height:36px!important;margin:0!important;padding:7px 8px!important;border-radius:9px!important;font-size:11px!important;display:grid!important;place-items:center!important;text-align:center!important}
.compactProfileEditors .photoSubmit{display:grid!important;grid-template-columns:1fr 1fr!important;gap:6px!important;align-content:start!important}
.compactProfileEditors .photoSubmit>.sectionTitle{grid-column:1/-1!important}
.compactProfileEditors .photoSubmit>img{grid-column:1/-1!important;width:42px!important;height:42px!important;object-fit:cover!important;border-radius:9px!important;margin:0 auto!important}
.compactProfileEditors .formError{grid-column:1/-1!important;font-size:9px!important;padding:6px!important;margin:0!important}
@media(max-width:420px){.compactProfileEditors{gap:8px}.compactProfileEditors .profilePanel{padding:10px!important}.compactProfileEditors .sectionTitle h2{font-size:13px!important}.compactProfileEditors .primary,.compactProfileEditors .uploadButton{font-size:10px!important;padding:6px!important}}
\`}</style><div className="compactProfileEditors"><PositionEditor player={player} onChange={onPositionChange}/><PhotoSubmission player={player} onSave={onPhotoSave}/></div></>}
  </>;
}`
      );

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
