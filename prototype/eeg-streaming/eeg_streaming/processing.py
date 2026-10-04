"""Small dependency-free feature processor for integration testing only."""

from __future__ import annotations

import math
from collections.abc import Mapping, Sequence
from typing import Any

from .contract import CHANNEL_NAMES, validate_eeg_frame
from .simulator import SampleBatch

BANDS = {"theta": (4.0, 8.0), "alpha": (8.0, 13.0), "beta": (13.0, 30.0)}


class ProcessingError(ValueError):
    pass


def _band_power(values: Sequence[float], sample_rate_hz: int, low: float, high: float) -> float:
    count = len(values)
    power = 0.0
    # Direct DFT keeps the prototype dependency-free and is sufficient for small windows.
    for bin_index in range(1, count // 2 + 1):
        frequency = bin_index * sample_rate_hz / count
        if low <= frequency < high:
            real = sum(value * math.cos(2 * math.pi * bin_index * i / count) for i, value in enumerate(values))
            imag = -sum(value * math.sin(2 * math.pi * bin_index * i / count) for i, value in enumerate(values))
            power += (real * real + imag * imag) / (count * count)
    return power


def process_batch(batch: SampleBatch, sequence: int, timestamp: float, stream_id: str) -> dict[str, object]:
    if not isinstance(batch, SampleBatch):
        raise ProcessingError("batch must be a SampleBatch")
    if not isinstance(sequence, int) or isinstance(sequence, bool) or sequence < 0:
        raise ProcessingError("sequence must be a non-negative integer")
    if not _is_finite_number(timestamp):
        raise ProcessingError("timestamp must be finite")
    if not isinstance(stream_id, str) or not stream_id:
        raise ProcessingError("stream_id must be a non-empty string")
    _validate_samples(batch.samples, batch.sample_rate_hz)
    channel_values = {name: round(values[-1], 4) for name, values in batch.samples.items()}
    mean_signal = [
        sum(batch.samples[name][index] for name in CHANNEL_NAMES) / len(CHANNEL_NAMES)
        for index in range(len(next(iter(batch.samples.values()))))
    ]
    raw = {name: _band_power(mean_signal, batch.sample_rate_hz, *limits) for name, limits in BANDS.items()}
    total = sum(raw.values())
    features = {name: round(value / total, 6) if total else 0.0 for name, value in raw.items()}
    peak = max(abs(value) for values in batch.samples.values() for value in values)
    quality = "good" if peak < 75 else "fair" if peak < 150 else "poor"
    message = {
        "schemaVersion": 1,
        "messageType": "eeg_frame",
        "streamId": stream_id,
        "timestamp": timestamp,
        "source": "simulation",
        "sequence": sequence,
        "sampleRateHz": batch.sample_rate_hz,
        "channels": channel_values,
        "features": features,
        "signalQuality": quality,
    }
    if not validate_eeg_frame(message):
        raise ProcessingError("generated frame failed contract validation")
    return message


def _is_finite_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def _validate_samples(samples: object, sample_rate_hz: object) -> None:
    if not isinstance(sample_rate_hz, int) or isinstance(sample_rate_hz, bool) or sample_rate_hz <= 0:
        raise ProcessingError("sample_rate_hz must be a positive integer")
    if not isinstance(samples, Mapping) or set(samples) != set(CHANNEL_NAMES):
        raise ProcessingError("batch must contain exactly the BrainXR channels and a positive sample rate")
    if any(
        isinstance(values, (str, bytes)) or not isinstance(values, Sequence)
        for values in samples.values()
    ):
        raise ProcessingError("every channel must contain a numeric sample sequence")
    try:
        lengths = {len(values) for values in samples.values()}
    except (TypeError, ValueError) as exc:
        raise ProcessingError("invalid channel sample window") from exc
    if len(lengths) != 1 or not lengths or next(iter(lengths)) < 2:
        raise ProcessingError("all channels must contain the same non-empty window")
    if any(not _is_finite_number(value) for values in samples.values() for value in values):
        raise ProcessingError("samples must be finite numbers")
