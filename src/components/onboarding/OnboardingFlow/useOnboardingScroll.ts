import { useState, useEffect, useRef, useCallback } from "react";

export interface BeatEnvelope {
  opacity: number;
  y: number;
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function calcEnvelope(
  progress: number,
  start: number,
  enterEnd: number,
  exitStart: number,
  end: number
): BeatEnvelope {
  if (progress <= start || progress >= end) return { opacity: 0, y: 28 };
  if (progress < enterEnd) {
    const t = (progress - start) / (enterEnd - start);
    const ease = 1 - Math.pow(1 - t, 3);
    return { opacity: ease, y: (1 - ease) * 24 };
  }
  if (progress <= exitStart) return { opacity: 1, y: 0 };
  const t = (end - progress) / (end - exitStart);
  const ease = t * t;
  return { opacity: ease, y: -(1 - ease) * 24 };
}

export function useOnboardingScroll(onComplete: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const [smoothProgress, setSmoothProgress] = useState(0);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) return;
    targetProgressRef.current = clamp01(el.scrollTop / max);
  }, []);

  // Butter-smooth RAF interpolation loop (0.1 damping)
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.0001) {
        currentProgressRef.current += diff * 0.12;
        setSmoothProgress(currentProgressRef.current);
      }
      if (currentProgressRef.current >= 0.95) {
        onComplete();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onComplete]);

  const scrollToProgress = useCallback((target: number) => {
    const el = containerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    el.scrollTo({ top: target * max, behavior: "smooth" });
  }, []);

  return { containerRef, smoothProgress, handleScroll, scrollToProgress };
}

export default useOnboardingScroll;
