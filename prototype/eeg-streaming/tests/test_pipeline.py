import math
import unittest

from eeg_streaming.contract import CHANNEL_NAMES, validate_eeg_frame, validate_xr_event
from eeg_streaming.bridge import EEGBridge
from eeg_streaming.processing import ProcessingError, process_batch
from eeg_streaming.simulator import EEGSimulator, SampleBatch


class SimulatorTests(unittest.TestCase):
    def test_fixed_seed_is_deterministic(self):
        first = EEGSimulator(seed=7).next_batch(16, 1000.0)
        second = EEGSimulator(seed=7).next_batch(16, 1000.0)
        self.assertEqual(first, second)

    def test_uses_all_brainxr_channels(self):
        batch = EEGSimulator().next_batch(4, 1000.0)
        self.assertEqual(set(batch.samples), set(CHANNEL_NAMES))


class ProcessorTests(unittest.TestCase):
    STREAM_ID = "stream-test-1"

    def test_message_schema_and_sequence(self):
        simulator = EEGSimulator(seed=3)
        frames = [process_batch(simulator.next_batch(64, 1000 + i), i, 1000 + i, self.STREAM_ID) for i in range(2)]
        self.assertTrue(all(validate_eeg_frame(frame) for frame in frames))
        self.assertEqual([frame["sequence"] for frame in frames], [0, 1])
        self.assertAlmostEqual(sum(frames[0]["features"].values()), 1.0, places=5)

    def test_rejects_all_malformed_sample_shapes_as_processing_error(self):
        valid = {name: [0.0, 1.0] for name in CHANNEL_NAMES}
        cases = []
        cases.append(None)
        cases.append({})
        cases.append({name: values for name, values in valid.items() if name != "Fp1"})
        cases.append({**valid, "Extra": [0.0, 1.0]})
        for bad_value in (1.0, "samples", None, [0.0, "bad"], [0.0, math.nan], [0.0, math.inf], []):
            cases.append({**valid, "Fp1": bad_value})
        cases.append({**valid, "Fp1": [0.0, 1.0, 2.0]})
        for samples in cases:
            with self.subTest(samples_type=type(samples).__name__):
                with self.assertRaises(ProcessingError):
                    process_batch(SampleBatch(0, 128, samples), 0, 1.0, self.STREAM_ID)

    def test_rejects_invalid_metadata_and_generated_overflow(self):
        samples = {name: [0.0, 1.0] for name in CHANNEL_NAMES}
        invalid_calls = (
            (SampleBatch(0, 0, samples), 0, 1.0, self.STREAM_ID),
            (SampleBatch(0, 128.5, samples), 0, 1.0, self.STREAM_ID),
            (SampleBatch(0, 128, samples), -1, 1.0, self.STREAM_ID),
            (SampleBatch(0, 128, samples), True, 1.0, self.STREAM_ID),
            (SampleBatch(0, 128, samples), 0, math.inf, self.STREAM_ID),
            (SampleBatch(0, 128, samples), 0, 1.0, "bad"),
        )
        for arguments in invalid_calls:
            with self.assertRaises(ProcessingError):
                process_batch(*arguments)


class SamplingScheduleTests(unittest.TestCase):
    def test_fractional_schedule_preserves_default_rate(self):
        bridge = EEGBridge(sample_rate_hz=128, update_rate_hz=20)
        counts = [bridge._next_sample_count() for _ in range(20)]
        self.assertEqual(sum(counts), 128)
        self.assertEqual(set(counts), {6, 7})

    def test_fractional_schedule_preserves_non_divisible_rate(self):
        bridge = EEGBridge(sample_rate_hz=250, update_rate_hz=60)
        counts = [bridge._next_sample_count() for _ in range(60)]
        self.assertEqual(sum(counts), 250)
        self.assertEqual(set(counts), {4, 5})


class EventContractTests(unittest.TestCase):
    def test_accepts_supported_event(self):
        self.assertTrue(validate_xr_event({
            "schemaVersion": 1, "messageType": "xr_event", "timestamp": 123.4, "event": "session_started"
        }))

    def test_rejects_unknown_or_malformed_event(self):
        self.assertFalse(validate_xr_event({"messageType": "xr_event", "event": "anything"}))
        self.assertFalse(validate_xr_event("not an object"))


if __name__ == "__main__":
    unittest.main()
