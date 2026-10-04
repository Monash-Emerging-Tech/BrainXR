import { parseEEGFrame, type EEGConnectionState, type EEGFrameMessage, type XREventMessage } from "../types/eeg.ts";

interface EEGSocket {
  readonly readyState: number;
  onopen: (() => void) | null;
  onmessage: ((event: { data: unknown }) => void) | null;
  onerror: (() => void) | null;
  onclose: (() => void) | null;
  send(data: string): void;
  close(code?: number, reason?: string): void;
}

export interface EEGWebSocketOptions {
  url: string;
  onFrame: (frame: EEGFrameMessage) => void;
  onStateChange: (state: EEGConnectionState) => void;
  maxReconnectAttempts?: number;
  reconnectBaseDelayMs?: number;
  createSocket?: (url: string) => EEGSocket;
}

export class EEGWebSocketClient {
  private readonly options: EEGWebSocketOptions;
  private socket: EEGSocket | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private retryCount = 0;
  private stopped = true;
  private generation = 0;

  constructor(options: EEGWebSocketOptions) {
    this.options = options;
  }

  connect(): void {
    if (!this.stopped) return;
    this.stopped = false;
    this.generation += 1;
    this.open(this.generation);
  }

  disconnect(): void {
    this.stopped = true;
    this.generation += 1;
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
    const socket = this.socket;
    this.socket = null;
    if (socket) {
      this.detach(socket);
      socket.close(1000, "BrainXR session ended");
    }
  }

  sendSessionStarted(): boolean {
    if (this.socket?.readyState !== 1) return false;
    const event: XREventMessage = {
      schemaVersion: 1,
      messageType: "xr_event",
      timestamp: Date.now() / 1000,
      event: "session_started",
    };
    this.socket.send(JSON.stringify(event));
    return true;
  }

  private open(generation: number): void {
    if (this.stopped || generation !== this.generation) return;
    this.options.onStateChange("connecting");
    try {
      this.socket = this.options.createSocket?.(this.options.url) ?? new WebSocket(this.options.url);
    } catch {
      this.options.onStateChange("error");
      this.scheduleReconnect(generation);
      return;
    }
    const socket = this.socket;
    socket.onopen = () => {
      if (!this.isCurrent(socket, generation)) return;
      this.options.onStateChange("connected");
      this.sendSessionStarted();
    };
    socket.onmessage = (event) => {
      if (!this.isCurrent(socket, generation)) return;
      if (typeof event.data !== "string") return;
      const frame = parseEEGFrame(event.data);
      if (frame) {
        this.retryCount = 0;
        this.options.onFrame(frame);
      }
    };
    socket.onerror = () => {
      if (this.isCurrent(socket, generation)) this.options.onStateChange("error");
    };
    socket.onclose = () => {
      if (!this.isCurrent(socket, generation)) return;
      this.detach(socket);
      this.socket = null;
      this.options.onStateChange("disconnected");
      this.scheduleReconnect(generation);
    };
  }

  private scheduleReconnect(generation: number): void {
    const maximum = this.options.maxReconnectAttempts ?? 8;
    if (this.stopped || generation !== this.generation || this.retryCount >= maximum || this.retryTimer) return;
    const base = this.options.reconnectBaseDelayMs ?? 500;
    const delay = Math.min(base * 2 ** this.retryCount, 10_000);
    this.retryCount += 1;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      if (!this.stopped && generation === this.generation) this.open(generation);
    }, delay);
  }

  private isCurrent(socket: EEGSocket, generation: number): boolean {
    return !this.stopped && generation === this.generation && socket === this.socket;
  }

  private detach(socket: EEGSocket): void {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onerror = null;
    socket.onclose = null;
  }
}
