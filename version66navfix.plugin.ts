import type { Plugin } from "vite";

function required(source:string,search:string,replacement:string){
  if(!source.includes(search))throw new Error(`Version 6.6 nav fix could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

export function version66NavigationFix():Plugin{
  return {
    name:"ys-guys-version-6-6-navigation-fix",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      let code=source;
      code=required(code,
        '      <Nav label="Home" icon="⌂" active={view==="home"} onClick={()=>go("home")}/><Nav label="Sunday" icon="✓" active={view==="attendance"} onClick={()=>go("attendance")}/><Nav label="Hall" icon="♛" active={view==="hof"} onClick={()=>go("hof")}/><Nav label="Profiles" icon="◎" active={["players","profile","compare"].includes(view)} onClick={()=>go("players")}/><Nav label="More" icon="•••" active={["more","community","timeline","voting","studio","rules","commissioner"].includes(view)} onClick={()=>go("more")}/>',
        '      <Nav label="Home" icon="⌂" active={view==="home"} onClick={()=>go("home")}/><Nav label="My Player" icon="◎" active={["profile","compare"].includes(view)} onClick={()=>myPlayer?openProfile(myPlayer):setShowMyPlayerPicker(true)}/><Nav label="Around League" icon="◫" active={["attendance","community","voting","calendar","rules","games","players","leaders","season-stats","studio","more"].includes(view)} onClick={()=>go("community")}/><Nav label="Hall & History" icon="♛" active={["hof","timeline","awards","records","seasons"].includes(view)} onClick={()=>go("hof")}/>'
      );
      code=required(code,
        '.bottomNav button{width:min(130px,20%);',
        '.bottomNav button{width:min(170px,25%);'
      );
      code += `\nconst version66NavigationFixStyles=\`\n@media(max-width:900px){.bottomNav{grid-template-columns:repeat(4,1fr)!important;display:grid!important}.bottomNav button{width:100%!important;min-width:0;padding:5px 2px}.bottomNav button small{font-size:9px;line-height:1.05;text-align:center;max-width:80px}.bottomNav button span{font-size:20px}}\n\`;`;
      code=required(code,
        '<style>{version66Styles}</style>',
        '<style>{version66Styles}</style><style>{version66NavigationFixStyles}</style>'
      );
      return {code,map:null};
    }
  };
}
