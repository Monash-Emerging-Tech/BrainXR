"""Async WebSocket bridge from the simulator/processor to BrainXR."""

from __future__ import annotations

import asyncio
import json
import logging
import time
import uuid
from collections import deque
from collections.abc import Callable

from .contract import CHANNEL_NAMES, validate_xr_event
from .processing import process_batch
from .simulator import EEGSimulator, SampleBatch

LOGGER = logging.getLogger("brainxr.eeg")


class EEGBridge:
    def __init__(self, sample_rate_hz: int = 128, update_rate_hz: int = 20, seed: int = 42, stream_id: str | None = None) -> None:
        if update_rate_hz <= 0 or update_rate_hz > sample_rate_hz:
            raise ValueError("update_rate_hz must be between 1 and sample_rate_hz")
        self.simulator = EEGSimulator(sample_rate_hz, seed)
        self.update_rate_hz = update_rate_hz
        self.stream_id = stream_id or str(uuid.uuid4())
        self.sequence = 0
        self._window = {name: deque(maxlen=sample_rate_hz) for name in CHANNEL_NAMES}
        self._sample_accumulator = 0.0
        self._clients: set[object] = set()
        self._clients_lock = asyncio.Lock()
        self._producer_task: asyncio.Task[None] | None = None

    def start(self) -> None:
        if self._producer_task is None or self._producer_task.done():
            self._producer_task = asyncio.create_task(self._produce(), name="brainxr-eeg-producer")

    async def stop(self) -> None:
        task = self._producer_task
        self._producer_task = None
        if task is not None:
            task.cancel()
            await asyncio.gather(task, return_exceptions=True)

    def _next_sample_count(self) -> int:
        """Fractional accumulator preserves the configured long-term sample rate."""
        self._sample_accumulator += self.simulator.sample_rate_hz / self.update_rate_hz
        count = int(self._sample_accumulator)
        self._sample_accumulator -= count
        return count

    async def handle(self, websocket: object) -> None:
        remote = getattr(websocket, "remote_address", "unknown")
        LOGGER.info("BrainXR client connected: %s", remote)
        self.start()
        async with self._clients_lock:
            self._clients.add(websocket)
        try:
            await self._receive_events(websocket)
        finally:
            async with self._clients_lock:
                self._clients.discard(websocket)
            LOGGER.info("BrainXR client disconnected: %s", remote)

    async def _produce(self) -> None:
        loop = asyncio.get_running_loop()
        deadline = loop.time()
        interval = 1 / self.update_rate_hz
        while True:
            sample_count = self._next_sample_count()
            now = time.time()
            if sample_count:
                batch = self.simulator.next_batch(sample_count, now)
                for name, values in batch.samples.items():
                    self._window[name].extend(values)
            if len(next(iter(self._window.values()))) >= self.simulator.sample_rate_hz:
                window = SampleBatch(
                    now - 1.0,
                    self.simulator.sample_rate_hz,
                    {name: list(values) for name, values in self._window.items()},
                )
                message = process_batch(window, self.sequence, now, self.stream_id)
                self.sequence += 1
                await self._broadcast(json.dumps(message, separators=(",", ":")))
            deadline += interval
            await asyncio.sleep(max(0.0, deadline - loop.time()))

    async def _broadcast(self, payload: str) -> None:
        async with self._clients_lock:
            clients = tuple(self._clients)
        if not clients:
            return
        results = await asyncio.gather(*(client.send(payload) for client in clients), return_exceptions=True)
        failed = {client for client, result in zip(clients, results) if isinstance(result, Exception)}
        if failed:
            async with self._clients_lock:
                self._clients.difference_update(failed)

    async def _receive_events(self, websocket: object) -> None:
        async for raw in websocket:
            try:
                event = json.loads(raw)
            except (json.JSONDecodeError, TypeError):
                LOGGER.warning("Rejected malformed XR event")
                continue
            if validate_xr_event(event):
                LOGGER.info("Received XR event: %s", event["event"])
            else:
                LOGGER.warning("Rejected invalid XR event")


async def serve(host: str, port: int, bridge: EEGBridge, on_started: Callable[[], None] | None = None) -> None:
    import websockets

    bridge.start()
    try:
        async with websockets.serve(bridge.handle, host, port):
            if on_started:
                on_started()
            await asyncio.Future()
    finally:
        await bridge.stop()
