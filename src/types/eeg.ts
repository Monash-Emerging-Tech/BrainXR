import { ELECTRODE_NAMES, type ElectrodeName } from "../utils/signalSource.ts";

export type EEGSignalQuality = "good" | "fair" | "poor";
export type EEGConnectionState = "connecting" | "connected" | "disconnected" | "error";

export interface EEGFrameMessage {
  schemaVersion: 1;
  messageType: "eeg_frame";
  streamId: string;
  timestamp: number;
  source: "simulation";
  sequence: number;
  sampleRateHz: number;
  channels: Record<ElectrodeName, number>;
  features: { theta: number; alpha: number; beta: number };
  signalQuality: EEGSignalQuality;
}

export interface XREventMessage {
  schemaVersion: 1;
  messageType: "xr_event";
  timestamp: number;
  event: "session_started";
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export function isEEGFrameMessage(value: unknown): value is EEGFrameMessage {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Record<string, unknown>;
  const channels = message.channels as Record<string, unknown> | null;
  const features = message.features as Record<string, unknown> | null;
  return (
    message.schemaVersion === 1 &&
    message.messageType === "eeg_frame" &&
    typeof message.streamId === "string" && /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/.test(message.streamId) &&
    message.source === "simulation" &&
    isFiniteNumber(message.timestamp) &&
    Number.isInteger(message.sequence) &&
    (message.sequence as number) >= 0 &&
    isFiniteNumber(message.sampleRateHz) &&
    message.sampleRateHz > 0 &&
    (message.signalQuality === "good" || message.signalQuality === "fair" || message.signalQuality === "poor") &&
    typeof channels === "object" && channels !== null &&
    Object.keys(channels).length === ELECTRODE_NAMES.length &&
    ELECTRODE_NAMES.every((name) => Object.hasOwn(channels, name) && isFiniteNumber(channels[name])) &&
    typeof features === "object" && features !== null &&
    ["theta", "alpha", "beta"].every((band) => isFiniteNumber(features[band]) && (features[band] as number) >= 0 && (features[band] as number) <= 1)
  );
}

export function parseEEGFrame(raw: string): EEGFrameMessage | null {
  try {
    if (hasDuplicateChannelKeys(raw)) return null;
    const value: unknown = JSON.parse(raw);
    return isEEGFrameMessage(value) ? value : null;
  } catch {
    return null;
  }
}

function hasDuplicateChannelKeys(raw: string): boolean {
  const match = /"channels"\s*:\s*\{/.exec(raw);
  if (!match) return false;
  const start = match.index + match[0].length;
  let depth = 1;
  let inString = false;
  let escaped = false;
  let end = -1;
  for (let index = start; index < raw.length; index += 1) {
    const character = raw[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
    } else if (character === '"') inString = true;
    else if (character === "{") depth += 1;
    else if (character === "}" && --depth === 0) {
      end = index;
      break;
    }
  }
  if (end < 0) return false;
  const keys = new Set<string>();
  const keyPattern = /"((?:\\.|[^"\\])*)"\s*:/g;
  for (const key of raw.slice(start, end).matchAll(keyPattern)) {
    const decoded = JSON.parse(`"${key[1]}"`) as string;
    if (keys.has(decoded)) return true;
    keys.add(decoded);
  }
  return false;
}
