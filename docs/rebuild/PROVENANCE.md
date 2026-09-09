# Sources and scope — 2026-09-09

The six new labs are reduced teaching implementations created in this repository. The original project checkouts were inspected read-only and remain unchanged.

| Lab | Evidence and relationship |
| --- | --- |
| Go admission | Informed by `go-review/cmd/inference-lab/main.go`: capacity before spawning, cooperative cancellation, admission and drain lifecycle. The standalone mutex-protected gate is a new implementation, not a copy of its HTTP service. |
| Go agent | Informed by `pi-go/internal/agent/loop.go` and tests. pi-go is a rewrite related to upstream [pi-mono](https://github.com/earendil-works/pi-mono). The reduced deterministic lab does not claim protocol or feature parity. |
| Python concurrency | Original standard-library worker/queue example, checked against Python TaskGroup behavior. |
| Python streams | Original event recorder and statistical functions, tested with prescribed timestamps and an injected clock. Events are not assumed to be model tokens. |
| Attention | Original rank-four tensor implementation, compared with PyTorch 2.14 scaled-dot-product attention on CPU. |
| KV cache | Original one-block decoder using the same attention implementation for full and cached execution. Fixed random weights and synthetic inputs test mechanics, not language ability. |

Go, Python, PyTorch, Shiki and Tailwind behavior was reviewed against official documentation. Each article links its own sources. Existing Wire content now identifies its archived status. Kafka storage/replication and application delivery articles have distinct scopes. The DDIA article explicitly identifies itself as a reading note; existing attribution is preserved where applicable.

All twelve prior article filenames and original publication dates are retained, with an update date. Prior decorative article covers are no longer displayed. Generated share cards use typography and site identity. No stock-image attribution is needed for the new share cards or CSS diagrams. Legacy unused source/assets remain in repository history and are not presented as new work.

No GPU, Kubernetes cluster, Kafka broker, Redis instance or production deployment was exercised in this delivery. Those articles identify their examples as explanatory and state runtime verification boundaries. No employment duration, client outcome or production throughput is inferred from the local projects.
