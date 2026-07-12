import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { STAGE } from "./config/stage";

const root = document.documentElement;
root.style.setProperty("--stage-w", `${STAGE.width}px`);
root.style.setProperty("--stage-h", `${STAGE.height}px`);
root.dataset.stageAspect = STAGE.aspect;
root.dataset.stageOrientation = STAGE.orientation;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
