import type { CSSProperties, ReactNode } from "react";
import { STAGE } from "../config/stage";
import { useStageScale } from "../hooks/useStageScale";

interface Props {
  onAdvance(): void;
  children: ReactNode;
}

/**
 * Fixed-aspect stage ({STAGE.aspect} · {STAGE.width}×{STAGE.height}).
 * Click anywhere except interactive children = advance.
 *
 * Layout structure (3 nested elements):
 *   .app-shell    ← full viewport, flex-centers the fitter
 *   .stage-fitter ← sized to ACTUAL VISIBLE px (width*scale × height*scale)
 *   .stage-frame  ← raw stage box, scaled from top-left into the fitter.
 *
 * Surface colors come from the active theme's CSS custom properties
 * (var(--shell), var(--surface)) — see themes/<id>/tokens.css.
 */
export function Stage({ onAdvance, children }: Props) {
  const scale = useStageScale();
  const fitterStyle: CSSProperties = {
    width: STAGE.width * scale,
    height: STAGE.height * scale,
  };
  const frameStyle: CSSProperties = {
    transform: `scale(${scale})`,
  };
  return (
    <div className="app-shell" data-orientation={STAGE.orientation}>
      <div className="stage-fitter" style={fitterStyle}>
        <div
          className="stage-frame"
          style={frameStyle}
          onClick={(e) => {
            const t = e.target as HTMLElement;
            if (t.closest("button, a, input, [data-no-advance]")) return;
            onAdvance();
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
