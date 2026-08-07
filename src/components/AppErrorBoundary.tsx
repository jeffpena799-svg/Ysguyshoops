import React from "react";

type State={hasError:boolean};

export default class AppErrorBoundary extends React.Component<React.PropsWithChildren,State>{
  state:State={hasError:false};
  static getDerivedStateFromError(){return {hasError:true}}
  componentDidCatch(error:unknown){console.error("Y's Guys client error",error)}
  private reset=()=>{try{sessionStorage.removeItem("yg-home-dashboard-disabled")}catch{};this.setState({hasError:false});window.location.reload()};
  render(){
    if(!this.state.hasError)return this.props.children;
    return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:24,background:"#06162f",color:"#fff",fontFamily:"system-ui,sans-serif"}}><section style={{maxWidth:520,textAlign:"center",padding:28,border:"1px solid #d5b45b",borderRadius:18,background:"#0c264b"}}><img src="/ys-guys-logo.svg" alt="Y's Guys" style={{width:90,height:90,objectFit:"contain"}}/><h1 style={{margin:"12px 0"}}>The app needs a quick refresh.</h1><p style={{color:"#c5cfdd",lineHeight:1.5}}>Your league data is safe. Reload the app to return to the working interface.</p><button onClick={this.reset} style={{marginTop:12,minHeight:48,padding:"0 20px",borderRadius:10,border:"1px solid #d5b45b",background:"#d5b45b",color:"#06162f",fontWeight:900}}>Reload app</button></section></main>;
  }
}