"""Deterministic, visually plausible (not medically accurate) EEG simulator."""

from __future__ import annotations

import math
import random
from dataclasses import dataclass

from .contract import CHANNEL_NAMES


@dataclass(frozen=True)
class SampleBatch:
    start_timestamp: float
    sample_rate_hz: int
    samples: dict[str, list[float]]


class EEGSimulator:
    def __init__(self, sample_rate_hz: int = 128, seed: int = 42) -> None:
        if sample_rate_hz <= 0:
            raise ValueError("sample_rate_hz must be positive")
        self.sample_rate_hz = sample_rate_hz
        self._random = random.Random(seed)
        self._sample_index = 0

    def next_batch(self, sample_count: int, start_timestamp: float) -> SampleBatch:
        if sample_count <= 0:
            raise ValueError("sample_count must be positive")
        output = {name: [] for name in CHANNEL_NAMES}
        for offset in range(sample_count):
            time_s = (self._sample_index + offset) / self.sample_rate_hz
            for channel_index, name in enumerate(CHANNEL_NAMES):
                phase = channel_index * 0.31
                value = (
                    8.0 * math.sin(2 * math.pi * 6.0 * time_s + phase)
                    + 13.0 * math.sin(2 * math.pi * 10.0 * time_s + phase * 1.3)
                    + 5.0 * math.sin(2 * math.pi * 20.0 * time_s + phase * 0.7)
                    + self._random.gauss(0.0, 1.5)
                )
                output[name].append(round(value, 6))
        self._sample_index += sample_count
        return SampleBatch(start_timestamp, self.sample_rate_hz, output)
