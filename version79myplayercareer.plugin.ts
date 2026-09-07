import type { Plugin } from "vite";

export function version79MyPlayerCareer():Plugin{
  return {
    name:"ys-guys-version-79-my-player-career",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx"))return null;
      let code=`import MyPlayerCareerHub from "./components/MyPlayerCareerHub";\n${source}`;
      const start=code.indexOf("function PlayerUniverseProfile(");
      const end=code.indexOf("function MyPlayerPerformance",start);
      if(start<0||end<0)throw new Error("My Player career patch could not locate the existing profile");
      const replacement=`function PlayerUniverseProfile({player,roster,sundaySessions,officialAwards,isMyPlayer,onProfileChange,onBack}:{player:Player;roster:Player[];games:Game[];sundaySessions:SundaySession[];nextRun?:SundayRun;officialAwards:Award[];rank:number;isMyPlayer:boolean;onRsvp:(runId:string,rsvp:Omit<RunRsvp,"updatedAt">)=>Promise<void>;onPhotoSave:(playerId:string,photoUrl:string)=>Promise<void>;onPositionChange:(playerId:string,position:string)=>Promise<void>;onProfileChange:(playerId:string,updates:{nickname?:string;position?:string;photoUrl?:string;archetypeChoice?:string;seenCareerBannerIds?:string[];careerStatusSeen?:boolean})=>Promise<void>;onBack:()=>void}){
  return <MyPlayerCareerHub player={player} roster={roster} sundaySessions={sundaySessions} officialAwards={officialAwards} isMyPlayer={isMyPlayer} onProfileChange={onProfileChange} onBack={onBack}/>;
}

`;
      code=code.slice(0,start)+replacement+code.slice(end);
      return {code,map:null};
    }
  };
}
