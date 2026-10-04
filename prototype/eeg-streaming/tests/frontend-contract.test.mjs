import assert from "node:assert/strict";
import test from "node:test";
import { ELECTRODE_NAMES } from "../../../src/utils/signalSource.ts";
import { isEEGFrameMessage, parseEEGFrame } from "../../../src/types/eeg.ts";
import { EEGWebSocketClient } from "../../../src/services/eegWebSocket.ts";
import { WebSocketSignalSource } from "../../../src/utils/webSocketSignalSource.ts";

const validFrame = {
  schemaVersion: 1, messageType: "eeg_frame", timestamp: 123.4, source: "simulation",
  streamId: "stream-a1",
  sequence: 1, sampleRateHz: 128,
  channels: Object.fromEntries(ELECTRODE_NAMES.map((name) => [name, 0.5])),
  features: { theta: 0.2, alpha: 0.5, beta: 0.3 }, signalQuality: "good",
};

test("accepts a valid v1 simulated frame", () => {
  assert.equal(isEEGFrameMessage(validFrame), true);
  assert.deepEqual(parseEEGFrame(JSON.stringify(validFrame)), validFrame);
});

test("safely rejects malformed and incomplete data", () => {
  assert.equal(parseEEGFrame("not JSON"), null);
  assert.equal(isEEGFrameMessage({ ...validFrame, source: "hardware" }), false);
  assert.equal(isEEGFrameMessage({ ...validFrame, channels: { Fp1: 1 } }), false);
  assert.equal(isEEGFrameMessage({ ...validFrame, channels: { ...validFrame.channels, Extra: 1 } }), false);
  assert.equal(isEEGFrameMessage({ ...validFrame, features: { theta: Number.NaN, alpha: 0, beta: 1 } }), false);
  const duplicated = JSON.stringify(validFrame).replace('"channels":{', '"channels":{"Fp1":99,');
  assert.equal(parseEEGFrame(duplicated), null);
});

test("accepts sequence reset only for a genuinely new stream", () => {
  const source = new WebSocketSignalSource();
  assert.equal(source.accept({ ...validFrame, streamId: "stream-a1", sequence: 50 }), true);
  assert.equal(source.accept({ ...validFrame, streamId: "stream-a1", sequence: 49 }), false);
  source.invalidate();
  assert.equal(Object.keys(source.getFrame().channels).length, 0);
  assert.equal(Object.keys(source.getFrame().channels).length, 0);
  assert.equal(source.accept({ ...validFrame, streamId: "stream-a1", sequence: 51 }), true);
  source.invalidate();
  assert.equal(source.accept({ ...validFrame, streamId: "stream-b2", sequence: 0 }), true);
  assert.equal(source.getFrame().channels.Fp1?.value, 0.5);
  assert.equal(source.accept({ ...validFrame, streamId: "stream-a1", sequence: 52 }), false);
});

class FakeSocket {
  readyState = 0;
  onopen = null;
  onmessage = null;
  onerror = null;
  onclose = null;
  sent = [];
  send(data) { this.sent.push(data); }
  close() { this.readyState = 3; }
}

test("cleanup while connecting invalidates every late callback", async () => {
  const sockets = [];
  const states = [];
  const frames = [];
  const client = new EEGWebSocketClient({
    url: "ws://test", onFrame: (frame) => frames.push(frame), onStateChange: (state) => states.push(state),
    reconnectBaseDelayMs: 1, createSocket: () => { const socket = new FakeSocket(); sockets.push(socket); return socket; },
  });
  client.connect();
  const socket = sockets[0];
  const late = { open: socket.onopen, message: socket.onmessage, error: socket.onerror, close: socket.onclose };
  client.disconnect();
  late.open();
  late.error();
  late.message({ data: JSON.stringify(validFrame) });
  late.close();
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.deepEqual(states, ["connecting"]);
  assert.equal(frames.length, 0);
  assert.equal(sockets.length, 1);
});

test("immediate-open failures consume a bounded retry budget and cleanup cancels timers", async () => {
  const sockets = [];
  const client = new EEGWebSocketClient({
    url: "ws://test", onFrame: () => {}, onStateChange: () => {}, maxReconnectAttempts: 2,
    reconnectBaseDelayMs: 1, createSocket: () => { const socket = new FakeSocket(); sockets.push(socket); return socket; },
  });
  client.connect();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const socket = sockets[attempt];
    socket.readyState = 1;
    socket.onopen();
    socket.onclose();
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  assert.equal(sockets.length, 3);

  const cleanupSockets = [];
  const cleanupClient = new EEGWebSocketClient({
    url: "ws://test", onFrame: () => {}, onStateChange: () => {}, reconnectBaseDelayMs: 10,
    createSocket: () => { const socket = new FakeSocket(); cleanupSockets.push(socket); return socket; },
  });
  cleanupClient.connect();
  cleanupSockets[0].onclose();
  cleanupClient.disconnect();
  await new Promise((resolve) => setTimeout(resolve, 15));
  assert.equal(cleanupSockets.length, 1);
});
