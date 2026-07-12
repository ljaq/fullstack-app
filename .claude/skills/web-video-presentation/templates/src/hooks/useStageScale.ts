import { useEffect, useState } from "react";
import { STAGE } from "../config/stage";

/**
 * Compute the scale needed to fit the stage inside the current viewport,
 * leaving marginX / marginY of breathing room around it
 * (so absolutely-positioned UI like the progress bar isn't cropped).
 */
export function useStageScale(
  baseW = STAGE.width,
  baseH = STAGE.height,
  marginX = STAGE.orientation === "portrait" ? 48 : 80,
  marginY = STAGE.orientation === "portrait" ? 64 : 100,
) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function update() {
      const isExport =
        new URLSearchParams(window.location.search).get("export") === "1";
      const mx = isExport ? 0 : marginX;
      const my = isExport ? 0 : marginY;
      const usefulW = Math.max(320, window.innerWidth - mx * 2);
      const usefulH = Math.max(180, window.innerHeight - my * 2);
      setScale(Math.min(usefulW / baseW, usefulH / baseH));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [baseW, baseH, marginX, marginY]);

  return scale;
}
