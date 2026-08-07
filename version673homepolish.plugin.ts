import type { Plugin } from "vite";

function replaceRequired(source:string, search:string, replacement:string){
  if(!source.includes(search)) throw new Error(`Version 6.7.3 Home polish could not find: ${search.slice(0,100)}`);
  return source.replace(search,replacement);
}

export function version673HomePolish():Plugin{
  return {
    name:"ys-guys-version-673-home-polish",
    enforce:"pre",
    transform(source,id){
      if(id.endsWith("/src/App.tsx")){
        let code=source;
        code=replaceRequired(code,
          '<header className="topbar">',
          '<header className="topbar" style={{minHeight:0,paddingTop:8,paddingBottom:8}}>'
        );
        code=replaceRequired(code,
          '<img className="brandMark" src={branding.logoUrl||initialBranding.logoUrl} alt=""/>',
          '<img className="brandMark" src="/ys-guys-logo.svg" alt="Y\'s Guys official brushstroke Y" style={{objectFit:"contain"}}/>'
        );
        return {code,map:null};
      }
      if(id.endsWith("/src/components/HomeDashboard.tsx")){
        let code=source;
        code=replaceRequired(code,
          '<section><small>OVERALL</small><strong>{overall(myPlayer)}</strong><h3>{myPlayer.name}</h3></section>',
          '<section><h3>{myPlayer.name}</h3></section>'
        );
        code=code.replace('grid-template-columns:auto auto 1fr auto','grid-template-columns:auto 1fr auto');
        return {code,map:null};
      }
      return null;
    }
  };
}
