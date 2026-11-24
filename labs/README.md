# Engineering Labs

Twelve reproducible experiments accompany **Engineering Reliable Model Systems** and **LLM & AI Infrastructure from First Principles**.
These are teaching implementations, not a deployable model-serving platform.

## Setup

From the repository root (or extracted archive root):

```sh
python3 -m venv labs/.venv
labs/.venv/bin/python -m pip install -r labs/requirements.txt
```

Or with `uv`:

```sh
uv run --with torch python -m unittest discover -s labs/llm/modern-transformer -p 'test_*.py' -v
```

Python 3.11+ and Go 1.24+ are required. Only the LLM tensor labs require PyTorch. No model downloads or API keys are used. All tensor operations explicitly run on CPU.

## Test all twelve labs

```sh
(cd labs/go && go test -race ./...)
python3 -m unittest discover -s labs/python/concurrency -p 'test_*.py' -v
python3 -m unittest discover -s labs/python/streaming -p 'test_*.py' -v
labs/.venv/bin/python -m unittest discover -s labs/llm/attention -p 'test_*.py' -v
labs/.venv/bin/python -m unittest discover -s labs/llm/kv-cache -p 'test_*.py' -v
labs/.venv/bin/python -m unittest discover -s labs/llm/modern-transformer -p 'test_*.py' -v
labs/.venv/bin/python -m unittest discover -s labs/llm/roofline-flash -p 'test_*.py' -v
labs/.venv/bin/python -m unittest discover -s labs/llm/deepseek-mla-grpo -p 'test_*.py' -v
labs/.venv/bin/python -m unittest discover -s labs/llm/flagship-2026 -p 'test_*.py' -v
labs/.venv/bin/python -m unittest discover -s labs/llm/looped-transformer -p 'test_*.py' -v
labs/.venv/bin/python -m unittest discover -s labs/llm/block-diffusion -p 'test_*.py' -v
```

## Reproduce the records

```sh
python3 labs/python/streaming/measure.py > labs/results/stream-fixture.json
labs/.venv/bin/python labs/llm/attention/attention.py
labs/.venv/bin/python labs/llm/kv-cache/benchmark.py --output labs/results/cache-results.json
labs/.venv/bin/python labs/llm/modern-transformer/modern_blocks.py
labs/.venv/bin/python labs/llm/roofline-flash/roofline_flash.py
labs/.venv/bin/python labs/llm/deepseek-mla-grpo/mla_grpo.py
labs/.venv/bin/python labs/llm/flagship-2026/flagship_blocks.py
labs/.venv/bin/python labs/llm/looped-transformer/looped_transformer.py
labs/.venv/bin/python labs/llm/block-diffusion/block_diffusion.py
```

The stream report uses prescribed timestamps, not a measured model. Decoder timings are local CPU microbenchmarks over a random-weight, one-block model. Compare correctness first, then timings under the same environment. Do not extrapolate these records to GPU throughput, language quality, or production capacity.

## Sources and attribution

- The admission gate is an original reduced example informed by the local `go-review` project's `cmd/inference-lab/main.go`. It isolates admission and draining instead of copying its HTTP gateway.
- The agent loop is an original reduced example informed by the local `pi-go` project's `internal/agent/loop.go` and tests. That project is a Go rewrite of [pi-mono](https://github.com/earendil-works/pi-mono). This lab is not wire compatible and is not a claim to the upstream design.
- Python concurrency and measurement implementations were created for these articles, drawing on the Python standard-library documentation.
- Attention and decoder implementations were created for these articles and checked against PyTorch operations. The code uses synthetic inputs and does not reproduce a trained model.

The original project checkouts are not dependencies. No credentials, session history, personal progress records, or upstream project files are packaged in the download.
