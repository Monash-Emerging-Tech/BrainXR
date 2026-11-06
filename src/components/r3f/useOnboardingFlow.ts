import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { headsetPresentation, type HeadsetPresentationStage } from "../../utils/headsetPresentation";

const STORY_SEEN_KEY = "brainxr:story-seen";

type ForcePage = "home" | "demo" | "onboarding" | "intensity" | "direction" | undefined;

// Debug-only escape hatch to preview the old scroll-driven story intro
// (superseded by OnboardingFlow) via ?story=v2.
function resolveStoryV2Debug(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("story") === "v2";
}

function resolveInitialShowStory(forcePage: ForcePage): boolean {
  if (forcePage === "onboarding") return true;
  if (forcePage === "home" || forcePage === "demo" || forcePage === "intensity" || forcePage === "direction") return false;
  if (typeof window === "undefined") return false;
  if (window.location.pathname.startsWith("/onboarding")) return true;
  if (window.location.pathname.startsWith("/intensity") || window.location.pathname.startsWith("/direction") || window.location.pathname.startsWith("/demo")) return false;
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("story") === "0" || urlParams.get("skipStory") === "1") return false;
  const seen = sessionStorage.getItem(STORY_SEEN_KEY);
  return !seen;
}

// Owns the home-screen onboarding story's visibility, fade/theme state, and
// its handoff with the headset presentation stage. Pulled out of R3F's
// composition root since it's a self-contained state machine with its own
// effects (popstate sync, Escape-to-cancel) that the rest of the root
// doesn't need to know about beyond the values/handlers returned here.
export function useOnboardingFlow(forcePage: ForcePage, isIdle: boolean) {
  const [headsetOpacity, setHeadsetOpacity] = useState(1);
  const [homeFadeOpacity, setHomeFadeOpacity] = useState(1);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [highlightPrefrontal, setHighlightPrefrontal] = useState(false);
  const [showStoryV2Debug] = useState(resolveStoryV2Debug);

  const [showStory, setShowStory] = useState(() => resolveInitialShowStory(forcePage));

  const [hasRoutedToOnboarding, setHasRoutedToOnboarding] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.location.pathname.startsWith("/onboarding");
  });

  // Keep story visibility synchronized with browser history back/forward
  useEffect(() => {
    const onPopState = () => {
      const isStory = window.location.pathname.startsWith("/onboarding");
      setShowStory(isStory);
      setHasRoutedToOnboarding(isStory);
      if (isStory) setHeadsetOpacity(1);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const storyStage = useSyncExternalStore(
    headsetPresentation.subscribe,
    headsetPresentation.getSnapshot,
    headsetPresentation.getServerSnapshot
  );
  const presentationStage: HeadsetPresentationStage = isIdle ? storyStage : "interactive";

  const cancelOnboarding = useCallback(() => {
    sessionStorage.setItem(STORY_SEEN_KEY, "1");
    setShowStory(false);
    setHasRoutedToOnboarding(false);
    setTheme("light");
    setHeadsetOpacity(1);
    setHomeFadeOpacity(1);
    headsetPresentation.setStage("showcase");
    headsetPresentation.setStoryProgress(null);
    setHighlightPrefrontal(false);
    if (typeof window !== "undefined") {
      if (window.location.pathname.startsWith("/onboarding")) {
        window.history.replaceState(null, "", "/");
      }
    }
  }, []);

  const handleRouteToOnboarding = useCallback(() => {
    setHasRoutedToOnboarding(true);
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/onboarding")) {
      window.history.pushState(null, "", "/onboarding");
    }
  }, []);

  // Global Escape key cancels onboarding before (or during) routing to /onboarding
  useEffect(() => {
    if (!showStory) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.code === "Escape") {
        cancelOnboarding();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showStory, cancelOnboarding]);

  const startStory = useCallback(() => {
    setHeadsetOpacity(1);
    setTheme("light");
    setHomeFadeOpacity(1);
    setHasRoutedToOnboarding(false);
    headsetPresentation.setStage("showcase");
    headsetPresentation.setStoryProgress(null);
    setHighlightPrefrontal(false);
    setShowStory(true);
  }, []);

  return {
    showStory,
    hasRoutedToOnboarding,
    headsetOpacity,
    setHeadsetOpacity,
    homeFadeOpacity,
    setHomeFadeOpacity,
    theme,
    setTheme,
    highlightPrefrontal,
    setHighlightPrefrontal,
    showStoryV2Debug,
    presentationStage,
    setPresentationStage: headsetPresentation.setStage,
    cancelOnboarding,
    handleRouteToOnboarding,
    startStory,
  };
}
