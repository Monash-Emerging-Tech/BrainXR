import React, { useEffect, useRef, useState, useMemo } from "react";
import { useOnboardingScroll, clamp01 } from "./useOnboardingScroll";
import BeatContent from "./BeatContent";
import EdgeProgressBar from "../EdgeProgressBar";
import SmokeShader from "../../story-v2/SmokeShader";
import { headsetPresentation, type HeadsetPresentationStage } from "../../../utils/headsetPresentation";

interface OnboardingFlowProps {
  onComplete: () => void;
  onRouteToOnboarding?: () => void;
  onInterrupt?: () => void;
  hasRoutedToOnboarding?: boolean;
  onHomeFade?: (opacity: number) => void;
  onHeadsetOpacity?: (opacity: number) => void;
  onHighlightPrefrontal?: (active: boolean) => void;
  onSetPresentationStage?: (stage: HeadsetPresentationStage) => void;
  onThemeChange?: (theme: "light" | "dark") => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete,
  onRouteToOnboarding,
  onInterrupt,
  hasRoutedToOnboarding = false,
  onHomeFade,
  onHeadsetOpacity,
  onHighlightPrefrontal,
  onSetPresentationStage,
  onThemeChange,
}) => {
  const { containerRef, smoothProgress, handleScroll, scrollToProgress } = useOnboardingScroll(onComplete);
  const [introElapsed, setIntroElapsed] = useState(0);
  const reachRef = useRef(0.01);
  const densityRef = useRef(0.0);
  const hasTriggeredRouteRef = useRef(hasRoutedToOnboarding);

  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const DURATION = 3600;
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = clamp01(elapsed / DURATION);
      setIntroElapsed(progress);
      if (progress < 0.45) {
        reachRef.current = 0.02 + Math.pow(progress / 0.45, 2.2) * 1.98;
        densityRef.current = Math.min(1.0, (progress / 0.45) * 2.5);
      } else {
        reachRef.current = 2.0 + ((progress - 0.45) / 0.55) * 0.4;
        densityRef.current = Math.max(0, 1.0 - Math.pow((progress - 0.45) / 0.55, 1.6));
      }
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const p = smoothProgress;
  const effectiveProgress = Math.max(introElapsed, clamp01(p / 0.08));
  const smokeActive = densityRef.current > 0.005 || introElapsed < 0.99;
  // Dynamic z-index: smoke sits on top (z-50) while dense, and text sits at z-40
  const smokeZIndex = densityRef.current > 0.01 ? 50 : 30;
  // As soon as smoke peaks and starts resolving, fade the question in rapidly so it is fully visible right as smoke disappears
  const introFadeProgress = clamp01((introElapsed - 0.5) / 0.35);

  const homeOpacity = useMemo(() => {
    if (effectiveProgress < 0.45) {
      return effectiveProgress < 0.18 ? 1.0 : 1.0 - (effectiveProgress - 0.18) / 0.27;
    }
    // In the finale (Beat 5), seamlessly fade the home page UI (headlines, actions) back in
    if (p < 0.88) return 0.0;
    return clamp01((p - 0.88) / 0.07);
  }, [p, effectiveProgress]);

  const headsetOpacity = useMemo(() => {
    if (p < 0.28 && effectiveProgress < 0.45) return homeOpacity;
    // Unified Scene Canvas:
    // From Beat 2 (p >= 0.28) through Beat 4, finale, and into the home page,
    // the single 3D Scene canvas renders both the brain and the headset with true 3D depth testing.
    return 1;
  }, [p, effectiveProgress, homeOpacity]);

  // Active beat tracks the exact narrative section based on beat thresholds
  const activeBeat = useMemo(() => {
    if (p < 0.20) return 0; // Origin
    if (p < 0.32) return 1; // Focus
    if (p < 0.53) return 2; // Vector
    if (p < 0.71) return 3; // Direction
    return 4;               // Intensity
  }, [p]);

  // Transition between 1st segment (Focus, ending ~0.28-0.33) and 2nd segment (Vector / Meditating, starting ~0.33)
  // Blinking effect occurs around 0.28 - 0.33, then background stays dark until after Intensity (p >= 0.88) flows back to light Home
  const isDarkPhase = p >= 0.31 && p < 0.88;
  const isBlinkingPhase = p >= 0.27 && p < 0.32;

  // Track triggered blink effect so that scrolling past 0.52 plays a cinematic multi-strobe blink
  const [hasBlinked, setHasBlinked] = useState(false);
  useEffect(() => {
    if (p >= 0.52 && !hasBlinked) {
      setHasBlinked(true);
    }
  }, [p, hasBlinked]);

  useEffect(() => {
    if (hasRoutedToOnboarding) {
      hasTriggeredRouteRef.current = true;
    }
  }, [hasRoutedToOnboarding]);

  // Route to /onboarding as soon as the intro transition commits (home fades away or user scrolls)
  useEffect(() => {
    if (!hasTriggeredRouteRef.current && (effectiveProgress >= 0.45 || p >= 0.04)) {
      hasTriggeredRouteRef.current = true;
      onRouteToOnboarding?.();
    }
  }, [effectiveProgress, p, onRouteToOnboarding]);

  useEffect(() => {
    onThemeChange?.(isDarkPhase ? "dark" : "light");
  }, [isDarkPhase, onThemeChange]);

  useEffect(() => {
    if (!hasRoutedToOnboarding && effectiveProgress < 0.45 && p < 0.04) {
      headsetPresentation.setStoryProgress(null);
    } else {
      headsetPresentation.setStoryProgress(p);
    }
    return () => {
      headsetPresentation.setStoryProgress(null);
    };
  }, [p, effectiveProgress, hasRoutedToOnboarding]);

  useEffect(() => {
    onHomeFade?.(homeOpacity);
    onHeadsetOpacity?.(headsetOpacity);
    const stage = p < 0.71 ? "showcase" : p < 0.89 ? "prefrontal" : "showcase";
    onSetPresentationStage?.(stage);
    onHighlightPrefrontal?.(p >= 0.71 && p < 0.89);
  }, [p, homeOpacity, headsetOpacity, onHomeFade, onHeadsetOpacity, onHighlightPrefrontal, onSetPresentationStage]);

  return (
    <>
      {smokeActive && (
        <div className="fixed inset-0 pointer-events-none transition-opacity duration-300" style={{ zIndex: smokeZIndex }}>
          <SmokeShader reachRef={reachRef} densityRef={densityRef} additive={false} color={[0.08, 0.1, 0.14]} maxOpacity={0.97} className="w-full h-full" />
        </div>
      )}

      {/* Blinking strobe overlay between Segment 1 and Segment 2 */}
      {isBlinkingPhase && (
        <div className="fixed inset-0 pointer-events-none z-35 animate-blink-invert" />
      )}

      <div
        ref={containerRef}
        onScroll={handleScroll}
        onClick={(e) => {
          if (!hasRoutedToOnboarding && !hasTriggeredRouteRef.current && onInterrupt) {
            const target = e.target as HTMLElement;
            if (!target.closest("button") && !target.closest("a")) {
              onInterrupt();
            }
          }
        }}
        className="fixed inset-0 z-40 overflow-y-auto overscroll-none scroll-smooth select-none"
      >
        <div className="h-[520vh] w-full relative">
          <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
            <BeatContent progress={p} introFadeProgress={introFadeProgress} isDark={isDarkPhase} />
            <EdgeProgressBar
              activeBeat={activeBeat}
              progress={p}
              isDark={isDarkPhase}
              onSkip={onComplete}
              onSelectBeat={(idx) => {
                const target = [0.0, 0.24, 0.42, 0.62, 0.82][idx] ?? 0;
                scrollToProgress(target);
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingFlow;
