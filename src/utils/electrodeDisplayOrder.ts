import { ELECTRODE_METADATA, ELECTRODE_NAMES, type ElectrodeName } from "./signalSource";

export const ELECTRODE_REGION_ORDER = ["Frontal", "Temporal", "Central", "Parietal", "Occipital"] as const;

// Shared by the waveform lanes and the card labels so every card stays
// attached to the signal it controls while related region colors remain grouped.
export const ELECTRODE_DISPLAY_ORDER: readonly ElectrodeName[] = ELECTRODE_REGION_ORDER.flatMap(
  (region) => ELECTRODE_NAMES.filter((name) => ELECTRODE_METADATA[name].region === region),
);
