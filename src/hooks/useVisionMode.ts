import { useState, useEffect, useCallback } from "react";

export type VisionMode =
  | "standard"
  | "protanomaly"
  | "protanopia"
  | "deuteranomaly"
  | "deuteranopia"
  | "tritanomaly"
  | "tritanopia"
  | "monochromacy";

export const VISION_MODES: { id: VisionMode; label: string; filter: string }[] = [
  { id: "standard", label: "Standard", filter: "none" },
  { id: "protanomaly", label: "Protanomaly", filter: "hue-rotate(-15deg) saturate(1.25)" },
  { id: "protanopia", label: "Protanopia", filter: "hue-rotate(-30deg) saturate(1.45) contrast(1.05)" },
  { id: "deuteranomaly", label: "Deuteranomaly", filter: "hue-rotate(15deg) saturate(1.25)" },
  { id: "deuteranopia", label: "Deuteranopia", filter: "hue-rotate(30deg) saturate(1.45) contrast(1.05)" },
  { id: "tritanomaly", label: "Tritanomaly", filter: "hue-rotate(60deg) saturate(1.2)" },
  { id: "tritanopia", label: "Tritanopia", filter: "hue-rotate(90deg) saturate(1.35) contrast(1.05)" },
  { id: "monochromacy", label: "Monochromacy", filter: "grayscale(1) contrast(1.15) brightness(0.95)" },
];

export const VISION_MODE_KEY = "brainxr:vision-mode";

export function getSavedVisionMode(): VisionMode {
  if (typeof window === "undefined") return "standard";
  const saved = localStorage.getItem(VISION_MODE_KEY) as VisionMode | null;
  return saved && VISION_MODES.some((m) => m.id === saved) ? saved : "standard";
}

export function useVisionMode() {
  const [visionMode, setVisionModeState] = useState<VisionMode>(getSavedVisionMode);

  useEffect(() => {
    const mode = VISION_MODES.find((m) => m.id === visionMode) ?? VISION_MODES[0];
    document.body.style.filter = mode.filter === "none" ? "" : mode.filter;
    try {
      localStorage.setItem(VISION_MODE_KEY, visionMode);
    } catch {
      // storage may be restricted in sandbox/private mode
    }
  }, [visionMode]);

  // Synchronize across multiple mounted components and browser windows
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === VISION_MODE_KEY && e.newValue) {
        if (VISION_MODES.some((m) => m.id === e.newValue)) {
          setVisionModeState(e.newValue as VisionMode);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setVisionMode = useCallback((mode: VisionMode) => {
    setVisionModeState(mode);
  }, []);

  return { visionMode, setVisionMode, modes: VISION_MODES };
}

