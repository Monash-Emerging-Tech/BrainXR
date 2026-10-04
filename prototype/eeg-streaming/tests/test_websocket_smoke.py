import asyncio
import json
import unittest

import websockets

from eeg_streaming.bridge import EEGBridge
from eeg_streaming.contract import validate_eeg_frame


class WebSocketSmokeTests(unittest.IsolatedAsyncioTestCase):
    async def _run_server_round(self, port=0):
        bridge = EEGBridge(sample_rate_hz=32, update_rate_hz=8, seed=9)
        async with websockets.serve(bridge.handle, "127.0.0.1", port) as server:
            bridge.start()
            try:
                actual_port = server.sockets[0].getsockname()[1]
                async with websockets.connect(f"ws://127.0.0.1:{actual_port}") as client:
                    await client.send("not-json")
                    await client.send(json.dumps({
                        "schemaVersion": 1,
                        "messageType": "xr_event",
                        "timestamp": 123.4,
                        "event": "session_started",
                    }))
                    message = json.loads(await asyncio.wait_for(client.recv(), timeout=3))
                    self.assertTrue(validate_eeg_frame(message))
                    return actual_port, message
            finally:
                await bridge.stop()

    async def test_bidirectional_stream_and_server_restart(self):
        with self.assertLogs("brainxr.eeg", level="INFO") as logs:
            port, first = await self._run_server_round()
            restarted_port, second = await self._run_server_round(port)
        self.assertEqual(restarted_port, port)
        self.assertEqual(first["sequence"], 0)
        self.assertEqual(second["sequence"], 0)
        self.assertNotEqual(first["streamId"], second["streamId"])
        self.assertTrue(any("Received XR event: session_started" in line for line in logs.output))
        self.assertTrue(any("Rejected malformed XR event" in line for line in logs.output))

    async def test_two_clients_receive_identical_broadcast_frames(self):
        bridge = EEGBridge(sample_rate_hz=32, update_rate_hz=8, seed=9)
        async with websockets.serve(bridge.handle, "127.0.0.1", 0) as server:
            bridge.start()
            try:
                port = server.sockets[0].getsockname()[1]
                async with (
                    websockets.connect(f"ws://127.0.0.1:{port}") as first,
                    websockets.connect(f"ws://127.0.0.1:{port}") as second,
                ):
                    first_frames = [json.loads(await asyncio.wait_for(first.recv(), timeout=3)) for _ in range(3)]
                    second_frames = [json.loads(await asyncio.wait_for(second.recv(), timeout=3)) for _ in range(3)]
                self.assertEqual(
                    [(frame["streamId"], frame["sequence"]) for frame in first_frames],
                    [(frame["streamId"], frame["sequence"]) for frame in second_frames],
                )
                self.assertEqual([frame["sequence"] for frame in first_frames], [0, 1, 2])
            finally:
                await bridge.stop()


if __name__ == "__main__":
    unittest.main()
