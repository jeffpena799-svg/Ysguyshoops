import type { Plugin } from "vite";

export function version688MyPlayerPolish():Plugin{
  return {
    name:"ys-guys-version-688-my-player-polish",
    enforce:"pre",
    transform(source,id){
      if(!id.endsWith("/src/App.tsx")) return null;
      const marker='return <div className={isMyPlayer?"myPlayerCompactPage":""}><style>';
      if(!source.includes(marker)) throw new Error("Version 6.8.8 could not locate compact My Player wrapper");
      const replacement=`return <div className={isMyPlayer?"myPlayerCompactPage":""}><style>{\`
.myPlayerCompactPage .playerDnaPanel .attributeRow b{color:#26313f!important}
@media(max-width:640px){
  .myPlayerCompactPage>.compactProfileEditors{
    display:grid!important;
    grid-template-columns:1fr 1fr!important;
    gap:0!important;
    height:68px!important;
    background:#fff!important;
    border:1px solid #d9dee7!important;
    border-radius:13px!important;
    overflow:hidden!important;
    box-shadow:0 8px 20px rgba(15,34,58,.08)!important;
  }
  .myPlayerCompactPage .compactProfileEditors>.profilePanel{
    margin:0!important;
    padding:6px 8px!important;
    height:68px!important;
    min-height:0!important;
    border:0!important;
    border-radius:0!important;
    background:#fff!important;
    box-shadow:none!important;
  }
  .myPlayerCompactPage .compactProfileEditors>.profilePanel+ .profilePanel{
    border-left:1px solid #d9dee7!important;
  }
  .myPlayerCompactPage .compactProfileEditors .sectionTitle h2{
    color:#26313f!important;
    font-size:9px!important;
    white-space:nowrap!important;
  }
  .myPlayerCompactPage .compactProfileEditors select,
  .myPlayerCompactPage .compactProfileEditors .primary,
  .myPlayerCompactPage .compactProfileEditors .uploadButton{
    min-height:27px!important;
    height:27px!important;
    font-size:8px!important;
  }
  .myPlayerCompactPage .compactProfileEditors .positionEditor>div{
    grid-template-columns:minmax(0,1fr) auto!important;
    gap:4px!important;
  }
  .myPlayerCompactPage .compactProfileEditors .positionEditor .primary{
    width:auto!important;
    min-width:48px!important;
  }
  .myPlayerCompactPage .compactProfileEditors .photoSubmit{
    grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
    gap:4px!important;
  }
}
\`}</style><style>`;
      return {code:source.replace(marker,replacement),map:null};
    }
  };
}
