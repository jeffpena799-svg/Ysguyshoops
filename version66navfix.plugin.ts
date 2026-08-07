import type { Plugin } from "vite";

function required(source:string,search:string,replacement:string){
  if(!source.includes(search))throw new Error(`Version 6.6 nav fix could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

function replaceBetween(source:string,start:string,end:string,replacement:string){
  const from=source.indexOf(start);
  if(from<0)throw new Error(`Version 6.6 nav fix could not find start: ${start}`);
  const to=source.indexOf(end,from);
  if(to<0)throw new Error(`Version 6.6 nav fix could not find end: ${end}`);
  return source.slice(0,from)+replacement+source.slice(to+end.length);
}

export function version66NavigationFix():Plugin{
  return {
    name:"ys-guys-version-6-6-navigation-fix",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      let code=source;
      code=replaceBetween(code,
        '    <nav className="bottomNav">',
        '    </nav>',
        `    <nav className="bottomNav">
      <Nav label="Home" icon="⌂" active={view==="home"} onClick={()=>go("home")}/>
      <Nav label="My Player" icon="◎" active={["profile","compare"].includes(view)} onClick={()=>myPlayer?openProfile(myPlayer):setShowMyPlayerPicker(true)}/>
      <Nav label="Around League" icon="◫" active={["attendance","community","voting","calendar","rules","games","players","leaders","season-stats","studio","more"].includes(view)} onClick={()=>go("community")}/>
      <Nav label="Hall & History" icon="♛" active={["hof","timeline","awards","records","seasons"].includes(view)} onClick={()=>go("hof")}/>
    </nav>`
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
