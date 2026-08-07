import type { Plugin } from "vite";

function replaceHome(source:string,replacement:string){
  const start='{view==="home" && <div className="home66">';
  const end='      {view==="attendance"';
  const from=source.indexOf(start);
  if(from<0)throw new Error("Safe Home dashboard could not find the Version 6.6 Home start marker");
  const to=source.indexOf(end,from);
  if(to<0)throw new Error("Safe Home dashboard could not find the attendance marker");
  return source.slice(0,from)+replacement+"\n\n"+source.slice(to);
}

export function version66HomeComponent():Plugin{
  return {
    name:"ys-guys-version-6-6-safe-home-component",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      let code='import HomeDashboard from "./components/HomeDashboard";\n'+source;
      code=replaceHome(code,`{view==="home" && <HomeDashboard
        players={players}
        nextRun={nextRun}
        featuredStory={featuredStory}
        publishedNews={publishedNews}
        latestFinal={latestFinal}
        rankings={latestRanking.entries}
        myPlayer={myPlayer}
        activeVote={activeRuleVote}
        formatDate={formatRunDate}
        onRsvp={async(runId,status)=>{
          if(!myPlayer){setShowMyPlayerPicker(true);return;}
          await submitRsvp(runId,{playerId:myPlayer.id,status});
        }}
        onChoosePlayer={()=>setShowMyPlayerPicker(true)}
        onOpenPlayer={(player:any)=>openProfile(player)}
        onNavigate={(target:any)=>go(target)}
      />}`);
      return {code,map:null};
    }
  };
}
