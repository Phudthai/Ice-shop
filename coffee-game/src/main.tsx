import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GameContainer } from "./components/GameContainer";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <>
    <div style={{ 
      visibility: 'hidden', 
      pointerEvents: 'none', 
      position: 'absolute', 
      zIndex: -1,
      width: '1px',
      height: '1px',
      overflow: 'hidden'
    }}>
      <GameContainer />
    </div>
    <App />
  </>,
);
