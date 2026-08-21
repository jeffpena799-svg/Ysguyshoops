import type { Plugin } from "vite";

export function version7LayoutFix():Plugin{
  return {name:"ys-guys-version-7-layout-fix",enforce:"pre",transform(source,id){
    if(id.endsWith("/src/components/AroundLeague.tsx")){
      let code=source;
      code=code.replace('<table className="atlTable">','<table className="atlTable atlTableV7">');
      return {code,map:null};
    }
    if(id.endsWith("/src/App.tsx")){
      const anchor='const styles = `';
      if(!source.includes(anchor))throw new Error("Version 7 layout fix could not find styles");
      const css=`\n.atlTableV7 th:first-child,.atlTableV7 td:first-child{width:34%!important}.atlTableV7 th:not(:first-child),.atlTableV7 td:not(:first-child){width:9.43%!important}.atlTableV7 th,.atlTableV7 td{padding-left:3px!important;padding-right:3px!important}.atlTableV7 th button{font-size:9px!important}@media(max-width:720px){.atlTableV7 th:first-child,.atlTableV7 td:first-child{width:35%!important}.atlTableV7 th:not(:first-child),.atlTableV7 td:not(:first-child){width:9.28%!important}.atlTableV7 th,.atlTableV7 td{padding-left:1px!important;padding-right:1px!important;font-size:7px!important}.atlTableV7 th button{font-size:6.5px!important}.atlTableV7 td>span{gap:2px!important}.atlTableV7 td img,.atlTableV7 td i{width:18px!important;height:18px!important}.atlTableV7 td>span b{font-size:7.5px!important}}\n`;
      return {code:source.replace(anchor,anchor+css),map:null};
    }
    return null;
  }};
}
