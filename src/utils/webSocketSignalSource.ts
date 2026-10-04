import type { EEGFrameMessage } from "../types/eeg.ts";
import { ELECTRODE_NAMES, type Frame, type SignalSource } from "./signalSource.ts";

export class WebSocketSignalSource implements SignalSource {
  private latest: EEGFrameMessage | null = null;
  private streamId: string | null = null;
  private sequence = -1;
  private readonly seenStreamIds = new Set<string>();

  accept(frame: EEGFrameMessage): boolean {
    if (frame.streamId !== this.streamId) {
      if (this.seenStreamIds.has(frame.streamId)) return false;
      this.streamId = frame.streamId;
      this.seenStreamIds.add(frame.streamId);
      this.sequence = -1;
    }
    if (frame.sequence <= this.sequence) return false;
    this.sequence = frame.sequence;
    this.latest = frame;
    return true;
  }

  invalidate(): void {
    this.latest = null;
  }

  getFrame(): Frame {
    if (!this.latest) return { phase: "idle", channels: {} };
    const quality = this.latest.signalQuality;
    return {
      phase: "stimulus",
      channels: Object.fromEntries(ELECTRODE_NAMES.map((name) => [name, { value: this.latest!.channels[name], quality }])) as Frame["channels"],
    };
  }
}
