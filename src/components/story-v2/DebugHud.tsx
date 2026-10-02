import { useEffect, useRef } from "react";
import { SCENES } from "./storyContentV2";
import { v2Debug } from "./v2Debug";

/**
 * Dev-only HUD: which scene is on screen, what phase the machine is in,
 * how long the scene has been running, and the live value of every ref the
 * opening timeline drives.
 *
 * Off unless `DEBUG_HUD` is flipped in storyContentV2 or the page is loaded
 * with `?v2debug=1`. It writes straight into a <pre> from its own rAF, so
 * it costs one text assignment a frame and zero React renders.
 */

export interface DebugHudProps {
  index: number;
  phase: string;
  startedAt: number;
  fastForwarded: boolean;
}

export default function DebugHud({
  index,
  phase,
  startedAt,
  fastForwarded,
}: DebugHudProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const propsRef = useRef({ index, phase, startedAt, fastForwarded });
  propsRef.current = { index, phase, startedAt, fastForwarded };

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      const el = preRef.current;
      if (el) {
        const p = propsRef.current;
        const scene = SCENES[p.index];
        const elapsed = p.startedAt ? Math.round(now - p.startedAt) : 0;
        el.textContent = [
          `scene   ${p.index} ${scene?.id ?? "?"}  (${scene?.durationMs ?? 0}ms)`,
          `phase   ${p.phase}${p.fastForwarded ? " +ff" : ""}`,
          `elapsed ${elapsed}ms`,
          `stage   ${v2Debug.stage}`,
          `reach   ${v2Debug.reach.toFixed(3)}   density ${v2Debug.density.toFixed(3)}`,
          `line    ${v2Debug.line.toFixed(3)}   swell   ${v2Debug.swell.toFixed(3)}`,
          `focus   ${v2Debug.focus.toFixed(3)}`,
          `smoke   frames ${v2Debug.smokeFrames}${
            v2Debug.smokeError ? `  ERR ${v2Debug.smokeError}` : ""
          }`,
          `brain   span ${v2Debug.brainSpan.toFixed(3)}  h ${v2Debug.brainHeight.toFixed(3)}`,
          `        on screen ${Math.round(v2Debug.brainSpanPx)}px wide, ${Math.round(
            v2Debug.brainHeightPx,
          )}px tall`,
        ].join("\n");
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <pre ref={preRef} className="storyv2-hud" data-testid="storyv2-hud" />;
}
