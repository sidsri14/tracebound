# Tracebound

Tracebound is an evidence-first incident investigation agent. It tests competing explanations across metrics, deployment records, incident history, and runbooks; challenges weak evidence coverage; and returns a conclusion whose claims link back to stable evidence IDs.

Built fresh during the Open Agent Hackathon 2026 for Track 2, **The Agent That Can Explain Why**.

> The included checkout incident and every bundled record are synthetic. Tracebound is a decision-support prototype, not an autonomous production remediation system.

## What makes it an agent

Tracebound is not a linear prompt wrapper. A Planner selects an initial evidence slice, an Investigator scores falsifiable hypotheses, a Challenger looks for contradictions and missing source types, and an Evaluator can force one bounded retry with broader context. Only then does the Synthesizer produce a cited conclusion and a reversible next action.

```text
fragmented evidence → World Model → Planner → Investigator
                         ↑                      ↓
                         └── retry ← Evaluator ← Challenger
                                                ↓
                                           Synthesizer
```

Each run records stable SHA-256-derived evidence IDs, provenance, selection reasons, agent steps, and cited evidence. In sample mode the whole flow is deterministic and network-free.

## Run the judgeable sample

Requirements: Node.js 20 or newer.

```bash
npm install
npm test
npm run sample
npm run dev
```

Open `http://127.0.0.1:3000`. The CLI writes the complete result to `output/sample-run.json`; the trace log is append-only JSONL at `logs/trace.jsonl`.

Three synthetic input/output pairs live under `examples/`. They cover checkout retries, a catalog cache regression, and an authentication resolver failure.

The multi-stage Docker image also builds cleanly from WSL2/Linux:

```bash
docker build -t tracebound:local .
docker run --rm -p 3000:3000 tracebound:local
```

Useful checks:

```bash
npm run typecheck
npm run build
curl http://127.0.0.1:3000/api/health
curl -X POST -H "content-type: application/json" -d '{"mode":"sample"}' http://127.0.0.1:3000/api/run
```

## Sponsor stack

- **Zetaris** is the live-mode data layer. `ZetarisEvidenceSource` runs a bounded REST SQL request and converts returned rows into provenance-bearing World Model records.
- **Meterless World Model Engine** is implemented by `WorldStoreService`, `IngestPipelineService`, and `ContextBuilderService`: stable IDs, idempotent ingest, append-friendly records, source-aware retrieval, and selection reasons.
- **Meterless Nightshift** is the live reasoning provider through its OpenAI-compatible endpoint. It is injected behind the same `Generator` interface used by network-free sample mode.
- **NVIDIA** can power Nightshift through a configured provider. Provider authorization belongs in Nightshift, not this repository.

Live sponsor verification is intentionally marked **pending** until the local Zetaris API key and Nightshift runtime token are created by the account owner. No credential or fake success is bundled.

The demo server exposes its synthetic rows at `GET /api/evidence`; a local Zetaris instance can register `http://host.docker.internal:3000/api/evidence` as a REST source and expose the `rows` array as `incident_evidence`. Live mode then retrieves those records through Zetaris, while Nightshift handles each reasoning stage and writes the final explanation.

Copy `.env.example` to `.env`, provide real local values, load it in your shell, and run:

```bash
npm run build
node dist/src/cli.js --mode live --scenario data/sample/scenario.json --output output/live-run.json
```

Live mode fails closed if required configuration is absent or either sponsor service fails. It never silently substitutes sample output.

## Evidence contract

Every evidence record carries:

- a stable content-derived ID and digest;
- source type, name, locator, and observation time;
- run and agent attribution;
- structured details plus explicit support/contradiction claims.

The sample assertions are annotations in synthetic fixture data. In a real deployment, evidence rows and hypothesis links should be produced from governed sources and reviewed under the operator's policies.

## Repository map

```text
src/agents/             feedback-loop orchestration
src/world-model/        Meterless World Model engine implementation
src/adapters/           Zetaris, Nightshift, and sample adapters
data/sample/            clearly labeled synthetic incident fragments
public/                 no-build demo interface
tests/                  idempotency, traceability, retry, and fail-closed tests
docs/                   architecture and sponsor integration details
```

See [architecture](docs/architecture.md), [sponsor integration](docs/sponsor-integration.md), [data sources](docs/data-sources.md), the [three-minute demo script](docs/demo-script.md), [deck outline](docs/deck-outline.md), and [submission draft](docs/submission-draft.md).

## Safety and limitations

- Recommendations are bounded and reversible; Tracebound does not execute remediation.
- API calls have timeouts and bounded retries.
- Trace logs redact credential-like fields.
- The deterministic scorer demonstrates traceability; it is not a calibrated probability model.
- Only synthetic data is included. Do not ingest secrets or personal data without appropriate controls.

MIT licensed.
