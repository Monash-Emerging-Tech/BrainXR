# BrainXR real-time EEG streaming prototype

This vertical slice proves deterministic simulated multichannel data -> basic processing -> local WebSocket -> BrainXR electrode and oscilloscope visualisations. It is an integration prototype, not a medical device. No value is a validated measure of focus, emotion, diagnosis, or brain state.

## Architecture

- `eeg_streaming/simulator.py` generates the 21 channels already mapped by BrainXR. A fixed seed produces repeatable sine-component-plus-noise samples.
- `eeg_streaming/processing.py` accepts a one-second rolling window, computes relative theta (4-8 Hz), alpha (8-13 Hz), and beta (13-30 Hz) power with a direct DFT, and derives a coarse simulated quality label.
- `eeg_streaming/bridge.py` runs one producer and broadcasts identical immutable frames to every client. A fractional sample accumulator preserves the configured long-term acquisition rate even when it is not divisible by the update rate.
- `src/services/eegWebSocket.ts` owns transport, bounded exponential reconnect, cleanup, and browser events. Its retry budget resets only after a valid EEG frame, not merely after a socket opens.
- `src/utils/webSocketSignalSource.ts` adapts the newest network frame to BrainXR's existing `SignalSource` interface. Demo and idle sources remain unchanged.

## Setup and run

From the repository root on Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r prototype\eeg-streaming\requirements.txt
$env:PYTHONPATH = "prototype\eeg-streaming"
.\.venv\Scripts\python -m eeg_streaming --host 127.0.0.1 --port 8765 --sample-rate 128 --update-rate 20 --seed 42
```

In another terminal, copy `.env.example` to `.env` if the default URL needs changing, then run `pnpm dev`. Open BrainXR and select **Connect your EEG headset**. The existing electrodes and traces update; the top pill shows `Simulation` and connection state. The backend logs the frontend's `session_started` event. Stop with Ctrl+C; restarting the bridge exercises bounded reconnection.

Configuration: backend flags are `--host` (local-only `127.0.0.1`), `--port` (8765), `--sample-rate` (128 Hz), `--update-rate` (20 Hz), and `--seed` (42). The frontend uses `PUBLIC_EEG_WEBSOCKET_URL`, defaulting to `ws://127.0.0.1:8765`.

## Wire contract v1

Backend to browser:

```json
{
  "schemaVersion": 1, "messageType": "eeg_frame", "streamId": "550e8400-e29b-41d4-a716-446655440000", "timestamp": 1791089102.42,
  "source": "simulation", "sequence": 128, "sampleRateHz": 128,
  "channels": { "Fp1": -12.4, "Fp2": -10.8, "FpZ": 1.2, "F3": 6.2, "F4": 7.1, "F7": 2.1, "F8": 3.2, "Fz": 4.3, "C3": 1.1, "C4": 2.2, "Cz": 3.3, "T3": 4.4, "T4": 5.5, "T5": 6.6, "T6": 7.7, "P3": 8.8, "P4": 9.9, "Pz": 1.0, "O1": 2.0, "O2": 3.0, "Oz": 4.0 },
  "features": { "theta": 0.18, "alpha": 0.43, "beta": 0.39 }, "signalQuality": "good"
}
```

All 21 keys are required exactly; missing, extra, duplicate, and non-finite channel data is rejected. Relative band powers are in `[0,1]`; their scientific interpretation is not validated. `streamId` is generated once per producer session, and sequence numbers increase monotonically within that stream. A new identifier permits a restarted producer to begin again at sequence zero without accepting delayed frames from an earlier stream.

Browser to backend:

```json
{ "schemaVersion": 1, "messageType": "xr_event", "timestamp": 1791089128.16, "event": "session_started" }
```

Unknown versions, events, missing channels, and non-finite values are rejected.

## Tests and demonstration

```powershell
Push-Location prototype\eeg-streaming
..\..\.venv\Scripts\python -m unittest discover -s tests -v
Pop-Location
node --experimental-strip-types prototype/eeg-streaming/tests/frontend-contract.test.mjs
.\node_modules\.bin\astro.cmd check
.\node_modules\.bin\astro.cmd build
```

For end to end, start bridge and frontend, enter live mode, confirm changing electrodes/traces and connected pill, confirm the event log, stop/restart the bridge, and confirm disconnected/connecting/connected transitions without a crash.

## Physical EEG, ROS 2, and CycloneDDS

A physical adapter can replace `EEGSimulator` while providing timestamped channel windows to `process_batch`, or replace both while preserving v1. Validate channel mapping, units, clocks, dropped data, consent, and device quality semantics.

ROS 2 was unavailable here and was not installed. A later verified phase should use `/brainxr/eeg/raw`, `/brainxr/eeg/features`, and `/brainxr/xr/events`, with a bridge retaining this WebSocket contract. Use CycloneDDS through ROS 2 by setting `$env:RMW_IMPLEMENTATION = "rmw_cyclonedds_cpp"`. Do not call that phase tested until its nodes, QoS, disconnects, and messages run in ROS 2.

## Security, privacy, and limitations

The server intentionally binds to loopback and has no authentication. Before public or participant use, require TLS (`wss://`), authentication/authorisation, origin controls, rate/size limits, audit-safe logging, encryption and retention policies, informed consent, access revocation, and threat/privacy review. Real EEG is sensitive participant data. This prototype has no artifact rejection, clinical calibration, hardware timing, packet-loss handling, persistence, or scientific validation.
