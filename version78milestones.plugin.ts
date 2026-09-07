import type { Plugin } from "vite";

function replaceRequired(source: string, search: string, replacement: string) {
  if (!source.includes(search)) throw new Error(`Official milestone patch could not find: ${search.slice(0, 120)}`);
  return source.replace(search, replacement);
}

export function version78Milestones(): Plugin {
  return {
    name: "ys-guys-version-78-official-milestones",
    enforce: "pre",
    transform(source, id) {
      if (!id.endsWith("/src/App.tsx")) return null;
      let code = source;

      code = replaceRequired(code,
`  pts:[
    {threshold:500,hallPoints:2,banner:"Bucket Club"},
    {threshold:1000,hallPoints:3,banner:"1K Club"},
    {threshold:2500,hallPoints:6,banner:"Elite Scorer"},
    {threshold:5000,hallPoints:10,banner:"Scoring Legend"},
    {threshold:8000,hallPoints:15,banner:"Immortal Scorer"},
  ],`,
`  pts:[
    {threshold:500,hallPoints:2,banner:"Bucket Getter"},
    {threshold:1000,hallPoints:3,banner:"Walking Bucket"},
    {threshold:2500,hallPoints:6,banner:"Walking Heat Check"},
    {threshold:5000,hallPoints:10,banner:"Bucket Factory"},
    {threshold:8000,hallPoints:15,banner:"Master of Buckets"},
  ],`);

      code = replaceRequired(code,
`  reb:[
    {threshold:250,hallPoints:2,banner:"Glass Cleaner"},
    {threshold:500,hallPoints:3,banner:"Board Collector"},
    {threshold:1000,hallPoints:5,banner:"1K Rebound Club"},
    {threshold:1500,hallPoints:6,banner:"Elite Rebounder"},
    {threshold:2500,hallPoints:10,banner:"Rebounding Legend"},
    {threshold:5000,hallPoints:10,banner:"Immortal Rebounder"},
  ],`,
`  reb:[
    {threshold:250,hallPoints:2,banner:"Board Crasher"},
    {threshold:500,hallPoints:3,banner:"Glass Cleaner"},
    {threshold:1000,hallPoints:5,banner:"Chairman of the Boards"},
    {threshold:2000,hallPoints:6,banner:"Board Hoarder"},
    {threshold:3500,hallPoints:10,banner:"Landlord of the Paint"},
    {threshold:6000,hallPoints:10,banner:"Master of the Glass"},
  ],`);

      code = replaceRequired(code,
`  ast:[
    {threshold:100,hallPoints:2,banner:"Ball Mover"},
    {threshold:200,hallPoints:3,banner:"Playmaker"},
    {threshold:500,hallPoints:5,banner:"Floor General"},
    {threshold:750,hallPoints:6,banner:"Elite Facilitator"},
    {threshold:1000,hallPoints:10,banner:"1K Assist Club"},
    {threshold:2000,hallPoints:15,banner:"Legendary Playmaker"},
  ],`,
`  ast:[
    {threshold:100,hallPoints:2,banner:"Dime Dropper"},
    {threshold:250,hallPoints:3,banner:"Table Setter"},
    {threshold:500,hallPoints:5,banner:"Pass First, Ask Later"},
    {threshold:1000,hallPoints:6,banner:"Floor General"},
    {threshold:1500,hallPoints:10,banner:"Court Visionary"},
    {threshold:2500,hallPoints:10,banner:"Master of Dimes"},
  ],`);

      code = replaceRequired(code,
`  wins:[
    {threshold:50,hallPoints:2,banner:"50 Wins Club"},
    {threshold:100,hallPoints:2,banner:"Century Winner"},
    {threshold:200,hallPoints:3,banner:"Proven Winner"},
    {threshold:300,hallPoints:4,banner:"300 Wins Club"},
    {threshold:400,hallPoints:5,banner:"Winning Standard"},
    {threshold:500,hallPoints:6,banner:"500 Wins Club"},
    {threshold:750,hallPoints:8,banner:"Elite Winner"},
    {threshold:1000,hallPoints:10,banner:"1K Wins Club"},
  ],`,
`  wins:[
    {threshold:50,hallPoints:2,banner:"Dub Disciple"},
    {threshold:100,hallPoints:3,banner:"Sunday Regular"},
    {threshold:250,hallPoints:4,banner:"Deacon of Dubs"},
    {threshold:500,hallPoints:5,banner:"Sunday Service Veteran"},
    {threshold:750,hallPoints:6,banner:"Minister of Wins"},
    {threshold:1000,hallPoints:6,banner:"Apostle of Victory"},
    {threshold:1250,hallPoints:10,banner:"The Chosen One"},
  ],
  stocks:[
    {threshold:25,hallPoints:2,banner:"Sticky Fingers"},
    {threshold:50,hallPoints:3,banner:"No-Fly Zone"},
    {threshold:100,hallPoints:5,banner:"Closed for Service"},
    {threshold:250,hallPoints:6,banner:"Stock Market"},
    {threshold:500,hallPoints:10,banner:"Wolf of Wall Street"},
    {threshold:750,hallPoints:10,banner:"Department of Defense"},
  ],`);

      code = replaceRequired(code,
`    {key:"wins" as const,label:"Career Wins",value:player.wins},
  ];`,
`    {key:"wins" as const,label:"Career Wins",value:player.wins},
    {key:"stocks" as const,label:"Career STL+BLK",value:defensiveTotal(player)},
  ];`);

      return { code, map: null };
    },
  };
}
