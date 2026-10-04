from __future__ import annotations

import argparse
import asyncio
import logging

from .bridge import EEGBridge, serve


def main() -> None:
    parser = argparse.ArgumentParser(description="BrainXR simulated EEG WebSocket bridge")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8765)
    parser.add_argument("--sample-rate", type=int, default=128)
    parser.add_argument("--update-rate", type=int, default=20)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")
    bridge = EEGBridge(args.sample_rate, args.update_rate, args.seed)
    try:
        asyncio.run(serve(args.host, args.port, bridge, lambda: logging.info("Listening on ws://%s:%s", args.host, args.port)))
    except KeyboardInterrupt:
        logging.info("Stopped")


if __name__ == "__main__":
    main()
