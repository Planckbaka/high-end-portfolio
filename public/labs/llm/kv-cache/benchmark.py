"""Write raw CPU timings. This is not a GPU or language-quality benchmark."""

import argparse
import json
import platform
import statistics
import time
from datetime import datetime, timezone
from pathlib import Path
import torch
from decoder import TinyDecoder, cache_bytes


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=Path("cache-results.json"))
    parser.add_argument("--repeats", type=int, default=7)
    args = parser.parse_args()
    if args.repeats < 2:
        parser.error("use at least two repeats")
    torch.manual_seed(11)
    torch.set_num_threads(1)
    model = TinyDecoder().cpu().eval()
    rows = []
    with torch.inference_mode():
        for length in [16, 32, 64, 128]:
            ids = torch.randint(0, 64, (1, length))

            def full():
                for end in range(1, length + 1):
                    model(ids[:, :end])

            def cached():
                cache = None
                for pos in range(length):
                    _, cache = model(ids[:, pos : pos + 1], cache)
                return cache

            full()
            cached()
            raw = {"full": [], "cached": []}
            for repeat in range(args.repeats):
                # Alternate order to reduce a systematic first-run advantage.
                for name in (
                    ["full", "cached"] if repeat % 2 == 0 else ["cached", "full"]
                ):
                    start = time.perf_counter_ns()
                    (full if name == "full" else cached)()
                    raw[name].append((time.perf_counter_ns() - start) / 1e6)
            rows.append(
                {
                    "tokens": length,
                    "cache_bytes": cache_bytes(cached()),
                    "raw_ms": raw,
                    "median_ms": {
                        name: statistics.median(values) for name, values in raw.items()
                    },
                }
            )
    output = {
        "kind": "CPU random-weight teacher-forced decoder microbenchmark",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "python": platform.python_version(),
        "torch": torch.__version__,
        "platform": platform.platform(),
        "device": "cpu",
        "threads": 1,
        "seed": 11,
        "repeats": args.repeats,
        "warmup_runs_per_mode": 1,
        "model": {
            "layers": 1,
            "width": 32,
            "heads": 4,
            "vocab": 64,
            "dtype": "float32",
            "batch": 1,
        },
        "rows": rows,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(output, indent=2) + "\n")
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
