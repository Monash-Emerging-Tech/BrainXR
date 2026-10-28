import { useEffect, useState } from "react";

/**
 * Tracks `prefers-reduced-motion: reduce`, and keeps tracking it -- the OS
 * setting can change while the page is open.
 *
 * Starts false so the first server/hydration pass is stable, then corrects
 * on mount.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

export default useReducedMotion;
