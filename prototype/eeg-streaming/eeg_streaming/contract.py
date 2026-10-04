"""Versioned wire-contract helpers shared by the bridge and its tests."""

from __future__ import annotations

import math
import re
from typing import Any

SCHEMA_VERSION = 1
CHANNEL_NAMES = (
    "Fp1", "Fp2", "FpZ", "F3", "F4", "F7", "F8", "Fz",
    "C3", "C4", "Cz", "T3", "T4", "T5", "T6",
    "P3", "P4", "Pz", "O1", "O2", "Oz",
)
SIGNAL_QUALITIES = {"good", "fair", "poor"}
XR_EVENTS = {"session_started"}
STREAM_ID_PATTERN = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$")


def _finite_number(value: Any) -> bool:
    return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)


def validate_eeg_frame(message: Any) -> bool:
    """Return whether *message* conforms to the v1 processed-frame schema."""
    if not isinstance(message, dict):
        return False
    if message.get("schemaVersion") != SCHEMA_VERSION or message.get("messageType") != "eeg_frame":
        return False
    if message.get("source") != "simulation" or message.get("signalQuality") not in SIGNAL_QUALITIES:
        return False
    if not isinstance(message.get("streamId"), str) or not STREAM_ID_PATTERN.fullmatch(message["streamId"]):
        return False
    if not _finite_number(message.get("timestamp")) or not isinstance(message.get("sequence"), int) or isinstance(message.get("sequence"), bool):
        return False
    if message["sequence"] < 0 or not _finite_number(message.get("sampleRateHz")) or message["sampleRateHz"] <= 0:
        return False
    channels = message.get("channels")
    features = message.get("features")
    return (
        isinstance(channels, dict)
        and set(channels) == set(CHANNEL_NAMES)
        and all(_finite_number(value) for value in channels.values())
        and isinstance(features, dict)
        and set(features) == {"theta", "alpha", "beta"}
        and all(_finite_number(value) and 0 <= value <= 1 for value in features.values())
    )


def validate_xr_event(message: Any) -> bool:
    """Validate the intentionally small v1 browser-to-bridge event contract."""
    return (
        isinstance(message, dict)
        and message.get("schemaVersion") == SCHEMA_VERSION
        and message.get("messageType") == "xr_event"
        and _finite_number(message.get("timestamp"))
        and message.get("event") in XR_EVENTS
    )
