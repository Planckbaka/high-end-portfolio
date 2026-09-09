# Engineering Labs

Six reproducible experiments accompany **Engineering Reliable Model Systems**.
These are teaching implementations, not a deployable model-serving platform.

## Setup

From the repository root (or extracted archive root):

```sh
python3 -m venv labs/.venv
labs/.venv/bin/python -m pip install -r labs/requirements.txt
```

Python 3.11+ and Go 1.24+ are required. Only the attention and cached-decoder labs require PyTorch. No model downloads or API keys are used. All tensor operations explicitly run on CPU.

## Test all six labs

```sh
(cd labs/go && go test -race ./...)
python3 -m unittest discover -s labs/python/concurrency -p 'test_*.py' -v
python3 -m unittest discover -s labs/python/streaming -p 'test_*.py' -v
labs/.venv/bin/python -m unittest discover -s labs/llm/attention -p 'test_*.py' -v
labs/.venv/bin/python -m unittest discover -s labs/llm/kv-cache -p 'test_*.py' -v
```

## Reproduce the records

```sh
python3 labs/python/streaming/measure.py > labs/results/stream-fixture.json
labs/.venv/bin/python labs/llm/attention/attention.py
labs/.venv/bin/python labs/llm/kv-cache/benchmark.py --output labs/results/cache-results.json
```

The stream report uses prescribed timestamps, not a measured model. Decoder timings are local CPU microbenchmarks over a random-weight, one-block model. Compare correctness first, then timings under the same environment. Do not extrapolate these records to GPU throughput, language quality, or production capacity.

## Sources and attribution

- The admission gate is an original reduced example informed by the local `go-review` project's `cmd/inference-lab/main.go`. It isolates admission and draining instead of copying its HTTP gateway.
- The agent loop is an original reduced example informed by the local `pi-go` project's `internal/agent/loop.go` and tests. That project is a Go rewrite of [pi-mono](https://github.com/earendil-works/pi-mono). This lab is not wire compatible and is not a claim to the upstream design.
- Python concurrency and measurement implementations were created for these articles, drawing on the Python standard-library documentation.
- Attention and decoder implementations were created for these articles and checked against PyTorch operations. The code uses synthetic inputs and does not reproduce a trained model.

The original project checkouts are not dependencies. No credentials, session history, personal progress records, or upstream project files are packaged in the download.
