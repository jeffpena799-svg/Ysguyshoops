import type { Plugin } from "vite";

function replaceRequired(source:string,search:string,replacement:string){
  if(!source.includes(search))throw new Error(`Header motto patch could not find: ${search.slice(0,120)}`);
  return source.replace(search,replacement);
}

export function version75HeaderMotto():Plugin{
  return {
    name:"ys-guys-version-75-header-motto",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      let code=source;
      const brandPattern=/(      <button className="brand"[^\n]+<\/button>)/;
      if(!brandPattern.test(code))throw new Error("Header motto patch could not find the brand button");
      code=code.replace(brandPattern,'$1\n      <div className="headerMotto" aria-label="Win the day">WIN THE DAY</div>');
      code=replaceRequired(code,'const styles = `\n',`const styles = \\`\n.headerMotto{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:\\${GOLD};font-size:clamp(14px,1.7vw,21px);font-weight:1000;font-style:italic;letter-spacing:.16em;white-space:nowrap;text-shadow:0 2px 12px rgba(0,0,0,.35);pointer-events:none}\n`);
      return {code,map:null};
    }
  };
}
