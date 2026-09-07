import type { Plugin } from "vite";

function replaceRequired(source: string, search: string, replacement: string) {
  if (!source.includes(search)) throw new Error(`Hall & History tabs patch could not find: ${search.slice(0, 120)}`);
  return source.replace(search, replacement);
}

export function version77HallHistory(): Plugin {
  return {
    name: "ys-guys-version-77-hall-history-tabs",
    enforce: "pre",
    transform(source, id) {
      if (!id.endsWith("/src/App.tsx")) return null;
      let code = source;
      code = replaceRequired(
        code,
        'import React, { useEffect, useMemo, useState } from "react";',
        'import React, { useEffect, useMemo, useState } from "react";\nimport HallHistory from "./components/HallHistory";',
      );
      code = replaceRequired(
        code,
        '{view==="hof" && <HallHub players={players} polls={polls} awards={awards} seasons={seasons} records={records} updatedAt={cloudUpdatedAt} onOpen={openProfile}/>}',
        '{view==="hof" && <HallHistory players={players} polls={polls} awards={awards} seasons={seasons} sundaySessions={sundaySessions} updatedAt={cloudUpdatedAt} onOpen={openProfile} getHallResume={(player)=>hallResume(player,awards)}/>}',
      );
      return { code, map: null };
    },
  };
}
