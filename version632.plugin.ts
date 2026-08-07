import type { Plugin } from "vite";

function replaceRequired(source: string, search: string, replacement: string): string {
  if (!source.includes(search)) {
    throw new Error(`Version 6.3.2 patch could not find expected source: ${search.slice(0, 100)}`);
  }
  return source.replace(search, replacement);
}

export function version632Feature(): Plugin {
  return {
    name: "ys-guys-version-6-3-2",
    enforce: "pre",
    transform(source, id) {
      if (!id.endsWith("/src/App.tsx")) return null;

      let code = source;

      // Version 6.5 owns the league branding replacement. Keep every rendered
      // league mark pinned to the official asset while preserving the 6.3.2
      // rating and eligibility improvements below.
      code = code.split('branding.logoUrl||initialBranding.logoUrl').join('"/ys-guys-logo.svg"');

      code = replaceRequired(
        code,
        'const eligible=roster.filter(player=>gp(player)>=5);\n  if(gp(p)<5||!eligible.some(player=>player.id===p.id))return null;',
        'const eligible=roster.filter(player=>gp(player)>=1);\n  if(gp(p)<1||!eligible.some(player=>player.id===p.id))return null;'
      );

      code = replaceRequired(
        code,
        'function overallRating(p:Player,roster:Player[],games:Game[]=[]){\n  if(typeof p.overallOverride==="number")return Math.max(40,Math.min(99,Math.round(p.overallOverride)));',
        'function overallRating(p:Player,roster:Player[],games:Game[]=[]){\n  if(gp(p)===0)return 1;\n  if(typeof p.overallOverride==="number")return Math.max(40,Math.min(99,Math.round(p.overallOverride)));'
      );

      code = code.split('version:"6.3.1"').join('version:"6.3.2"');
      code = code.split('v6.3.1').join('v6.3.2');
      code = code.split('Version 6.3.1').join('Version 6.3.2');

      return { code, map: null };
    },
  };
}
