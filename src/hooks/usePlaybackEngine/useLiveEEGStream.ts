import { useEffect, type RefObject } from "react";
import { EEGWebSocketClient } from "../../services/eegWebSocket.ts";
import type { AppMode } from "../../utils/appMode";
import type { SignalSource } from "../../utils/signalSource";
import { WebSocketSignalSource } from "../../utils/webSocketSignalSource";
import { clearHistories, type Histories } from "./history";

interface Params {
  modeKind: AppMode["kind"];
  sourceRef: RefObject<SignalSource>;
  historiesRef: RefObject<Histories>;
  setMode: (mode: AppMode) => void;
}

export function useLiveEEGStream({ modeKind, sourceRef, historiesRef, setMode }: Params): void {
  useEffect(() => {
    if (modeKind !== "live") return;
    const source = new WebSocketSignalSource();
    sourceRef.current = source;
    const client = new EEGWebSocketClient({
      url: import.meta.env.PUBLIC_EEG_WEBSOCKET_URL ?? "ws://127.0.0.1:8765",
      onFrame: (frame) => source.accept(frame),
      onStateChange: (connection) => {
        if (connection !== "connected") {
          source.invalidate();
          clearHistories(historiesRef.current);
        }
        setMode({ kind: "live", connection });
      },
    });
    client.connect();
    return () => client.disconnect();
  }, [modeKind, sourceRef, historiesRef, setMode]);
}
