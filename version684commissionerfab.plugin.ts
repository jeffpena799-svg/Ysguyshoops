import type { Plugin } from "vite";

function replaceRequired(source:string, search:string, replacement:string){
  if(!source.includes(search)) throw new Error(`Commissioner launcher patch could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

export function version684CommissionerFab():Plugin{
  return {
    name:"ys-guys-version-684-commissioner-launcher",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx")) return null;
      let code=source;

      code=replaceRequired(
        code,
        '    <nav className="bottomNav">',
        '    <button className={`commissionerFab ${sessionToken?"unlocked":""}`} onClick={()=>go("commissioner")} aria-label="Commissioner Mode" title="Commissioner Mode"><span>♛</span><b>{sessionToken?"Commissioner":"Commissioner"}</b></button>\n    <nav className="bottomNav">'
      );

      code=replaceRequired(
        code,
        '.bottomNav{position:fixed;',
        '.commissionerFab{position:fixed;right:16px;bottom:88px;z-index:29;border:1px solid #c7a24d;background:#071f42;color:#e8c876;border-radius:999px;padding:10px 14px;display:flex;align-items:center;gap:7px;font-weight:900;box-shadow:0 10px 24px rgba(0,0,0,.22)}.commissionerFab.unlocked{background:#c7a24d;color:#071f42}.commissionerFab span{font-size:16px}.commissionerFab b{font-size:11px}@media(max-width:640px){.commissionerFab{width:46px;height:46px;padding:0;justify-content:center;bottom:82px;border-radius:50%}.commissionerFab b{display:none}}.bottomNav{position:fixed;'
      );

      return {code,map:null};
    }
  };
}
