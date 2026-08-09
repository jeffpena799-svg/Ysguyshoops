import type { Plugin } from "vite";

export function version687MyPlayerCompact():Plugin{
  return {
    name:"ys-guys-version-687-my-player-no-scroll",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx")) return null;

      const start=source.indexOf("function PlayerUniverseProfile(");
      const end=source.indexOf("function MyPlayerPerformance",start);
      if(start<0||end<0) throw new Error("Version 6.8.7 could not locate PlayerUniverseProfile");

      let segment=source.slice(start,end);
      const returnMarker="return <><style>";
      const returnAt=segment.indexOf(returnMarker);
      if(returnAt<0) throw new Error("Version 6.8.7 could not locate profile return wrapper");
      segment=segment.replace(returnMarker,'return <div className={isMyPlayer?"myPlayerCompactPage":""}><style>');

      const styleButton='</style><button className="backButton"';
      if(!segment.includes(styleButton)) throw new Error("Version 6.8.7 could not locate profile style boundary");
      segment=segment.replace(styleButton,`</style>{isMyPlayer&&<style>{\`
@media(max-width:640px){
  main:has(.myPlayerCompactPage){padding-top:6px!important;padding-bottom:76px!important}
  .myPlayerCompactPage{height:calc(100dvh - 150px);max-height:700px;overflow:hidden;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:minmax(118px,1.05fr) minmax(128px,1fr) minmax(138px,1.08fr) 72px;gap:7px;align-content:stretch}
  .myPlayerCompactPage>.backButton{display:none!important}
  .myPlayerCompactPage>.profileHeroClean{grid-column:1/-1;min-height:0!important;height:100%!important;margin:0!important;padding:10px 12px!important;border-radius:16px!important;grid-template-columns:82px 1fr!important;gap:10px!important;text-align:left!important;overflow:hidden}
  .myPlayerCompactPage .profilePhotoWrap{width:82px!important;height:96px!important;margin:0!important}
  .myPlayerCompactPage .profilePhotoWrap img{width:82px!important;height:96px!important;border-radius:14px!important;object-fit:cover!important}
  .myPlayerCompactPage .profilePhotoWrap b{font-size:11px!important;padding:4px 6px!important}
  .myPlayerCompactPage .ratingOrb{width:78px!important;height:78px!important;margin:auto 0!important}
  .myPlayerCompactPage .universeIdentity{align-self:center!important;min-width:0}
  .myPlayerCompactPage .universeIdentity>span{font-size:8px!important;letter-spacing:.08em!important}
  .myPlayerCompactPage .universeIdentity h1{font-size:24px!important;line-height:1!important;margin:3px 0!important}
  .myPlayerCompactPage .universeIdentity p{font-size:12px!important;margin:0 0 5px!important}
  .myPlayerCompactPage .profileTags{gap:4px!important;justify-content:flex-start!important;flex-wrap:wrap!important}
  .myPlayerCompactPage .profileTags b{font-size:7px!important;padding:4px 6px!important;border-radius:999px!important}

  .myPlayerCompactPage>.profilePanel{margin:0!important;padding:9px!important;border-radius:14px!important;min-height:0!important;height:100%!important;overflow:hidden!important}
  .myPlayerCompactPage>.playerDnaPanel{grid-column:1;grid-row:2}
  .myPlayerCompactPage>.legacyPanel{grid-column:2;grid-row:2}
  .myPlayerCompactPage>.profileGameLog{grid-column:1;grid-row:3}
  .myPlayerCompactPage>.careerBests{grid-column:2;grid-row:3}
  .myPlayerCompactPage>.compactProfileEditors{grid-column:1/-1;grid-row:4;margin:0!important;gap:7px!important;height:72px!important}

  .myPlayerCompactPage .sectionTitle{margin:0 0 5px!important}
  .myPlayerCompactPage .sectionTitle span{font-size:6px!important;letter-spacing:.1em!important}
  .myPlayerCompactPage .sectionTitle h2{font-size:13px!important;line-height:1!important;margin:2px 0 0!important}

  .myPlayerCompactPage .playerDnaPanel .attributeRow{grid-template-columns:48px 1fr 22px!important;gap:4px!important;margin:0!important;min-height:17px!important}
  .myPlayerCompactPage .playerDnaPanel .attributeRow b,.myPlayerCompactPage .playerDnaPanel .attributeRow strong{font-size:7px!important}
  .myPlayerCompactPage .playerDnaPanel .attributeRow span{height:4px!important}
  .myPlayerCompactPage .playerDnaPanel .bio{display:none!important}

  .myPlayerCompactPage .legacyLevelHeader{align-items:center!important;gap:5px!important}
  .myPlayerCompactPage .legacyLevelHeader small{font-size:6px!important}
  .myPlayerCompactPage .legacyLevelHeader h3{font-size:12px!important;line-height:1!important;margin:1px 0!important}
  .myPlayerCompactPage .legacyLevelHeader strong{font-size:16px!important}
  .myPlayerCompactPage .legacyLevelTrack{height:5px!important;margin:5px 0!important}
  .myPlayerCompactPage .legacyLevels,.myPlayerCompactPage .legacyHonors{display:none!important}
  .myPlayerCompactPage .legacySummary{grid-template-columns:repeat(2,1fr)!important;gap:3px!important;margin:5px 0 0!important}
  .myPlayerCompactPage .legacySummary span{padding:4px 3px!important;border-radius:7px!important;font-size:6px!important;line-height:1.05!important}
  .myPlayerCompactPage .legacySummary b{font-size:11px!important;margin-bottom:1px!important}

  .myPlayerCompactPage .profileGameLog .empty{font-size:9px!important;line-height:1.2!important;padding:8px 2px!important}
  .myPlayerCompactPage .profileGameLog .logHead,.myPlayerCompactPage .profileGameLog .logRow{grid-template-columns:minmax(64px,1fr) repeat(4,20px)!important;gap:2px!important;padding:4px 2px!important;font-size:7px!important;min-width:0!important}
  .myPlayerCompactPage .profileGameLog .logRow:nth-of-type(n+4){display:none!important}
  .myPlayerCompactPage .profileGameLog .logRow small{font-size:6px!important}

  .myPlayerCompactPage .careerHighGrid{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:4px!important}
  .myPlayerCompactPage .careerHighGrid article{padding:6px!important;border-radius:9px!important;min-height:48px!important}
  .myPlayerCompactPage .careerHighGrid small{font-size:5px!important}
  .myPlayerCompactPage .careerHighGrid strong{font-size:18px!important;line-height:1!important;margin:2px 0!important}
  .myPlayerCompactPage .careerHighGrid b{font-size:7px!important}
  .myPlayerCompactPage .careerHighGrid span{display:none!important}

  .myPlayerCompactPage .compactProfileEditors .profilePanel{padding:6px!important;border-radius:10px!important;height:72px!important;overflow:hidden!important}
  .myPlayerCompactPage .compactProfileEditors .sectionTitle{margin-bottom:3px!important}
  .myPlayerCompactPage .compactProfileEditors .sectionTitle span{display:none!important}
  .myPlayerCompactPage .compactProfileEditors .sectionTitle h2{font-size:9px!important}
  .myPlayerCompactPage .compactProfileEditors select,.myPlayerCompactPage .compactProfileEditors .primary,.myPlayerCompactPage .compactProfileEditors .uploadButton{min-height:25px!important;height:25px!important;padding:3px 5px!important;font-size:8px!important;border-radius:6px!important}
  .myPlayerCompactPage .compactProfileEditors .photoSubmit{gap:3px!important}
  .myPlayerCompactPage .compactProfileEditors .photoSubmit>img{display:none!important}
}
@media(max-width:390px){
  .myPlayerCompactPage{height:calc(100dvh - 146px);grid-template-rows:minmax(110px,1fr) minmax(120px,1fr) minmax(130px,1fr) 68px;gap:6px}
  .myPlayerCompactPage>.profileHeroClean{grid-template-columns:72px 1fr!important;padding:8px 10px!important}
  .myPlayerCompactPage .profilePhotoWrap,.myPlayerCompactPage .profilePhotoWrap img{width:72px!important;height:86px!important}
  .myPlayerCompactPage .universeIdentity h1{font-size:21px!important}
}
\`}</style>}<button className="backButton"`);

      const lastClose=segment.lastIndexOf("</>;");
      if(lastClose<0) throw new Error("Version 6.8.7 could not locate profile closing fragment");
      segment=segment.slice(0,lastClose)+"</div>;"+segment.slice(lastClose+4);

      return {code:source.slice(0,start)+segment+source.slice(end),map:null};
    }
  };
}
