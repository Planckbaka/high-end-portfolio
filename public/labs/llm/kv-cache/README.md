# A tiny cached decoder

Run from the repository root (the directory containing `labs`). After downloading the archive, extract it and run from the extracted root.

```sh
labs/.venv/bin/python -m unittest discover -s labs/llm/kv-cache -p "test_*.py" -v
labs/.venv/bin/python labs/llm/kv-cache/benchmark.py --output labs/results/cache-results.json
```

Go requires 1.24 or newer. Python requires 3.11 or newer. The two LLM labs additionally require CPU-capable PyTorch in `labs/.venv`; see the [collection instructions](/labs/README.md).

Tests use deterministic substitutes or synthetic tensors. No paid API, cloud service, model-weight download, GPU, or external project checkout is required. A failed test is a correctness issue to investigate; raw timing changes alone do not fail the tests.

Read the source and tests together. The article's code excerpts are extracted from marked regions in these files during the website build.
