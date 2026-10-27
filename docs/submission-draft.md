# Open Agent Hackathon Submission Draft

## Project

**Tracebound - Evidence-First Incident Investigation**

## Track

The Agent That Can Explain Why

## Short description

Tracebound investigates why a service metric changed by testing competing hypotheses across metrics, deployment records, incident history, and runbooks. Its bounded Planner-Investigator-Challenger-Evaluator loop can reject an incomplete first pass, retrieve broader evidence, and return a cited conclusion plus a reversible action.

## Problem

On-call responders routinely receive plausible but weak explanations assembled from fragmented tools. A dashboard can show that error rate rose, but it does not prove whether the cause was a deploy, traffic spike, database saturation, or a downstream dependency. Untraceable model summaries add another risk: responders cannot see what evidence was omitted or what contradicted the conclusion.

## What Tracebound does

- Normalizes evidence into a shared World Model with stable SHA-256-derived IDs and provenance.
- Scores explicit support and contradiction for every candidate hypothesis.
- Uses a Challenger and Evaluator to detect weak coverage and allow one bounded retry.
- Produces a final explanation whose claims link to evidence IDs.
- Recommends a reversible runbook action; it never executes remediation.
- Fails closed in live mode if the configured data or model provider is unavailable.

## Sponsor technology

- **Zetaris:** live-mode data layer queried through a bounded REST SQL adapter. Returned rows become provenance-bearing World Model records.
- **Meterless World Model Engine:** implemented through `WorldStoreService`, `IngestPipelineService`, and `ContextBuilderService` for duplicate-safe ingest, shared state, ranked retrieval, and selection reasons.
- **Meterless Nightshift:** primary live reasoning provider behind an OpenAI-compatible adapter. Each agent stage receives evidence summaries, and the final explanation is written through the same provider.
- **NVIDIA:** can power Nightshift through a configured provider; Tracebound records the model actually returned rather than assuming a Nemotron route.

Do not change “can power” to “powered” until the live run is verified and preserved without secrets.

## Evidence of working software

- Three clearly synthetic incident cases.
- Nine passing tests covering stable ingest, retrieval reasons, bounded retry, all three cases, fail-closed adapters, sponsor response parsing, actual-model capture, and live final synthesis through fake HTTP services.
- TypeScript typecheck and build pass.
- Multi-stage Docker image builds and serves both health and sample-run endpoints.
- Browser UI exposes the complete agent trace and evidence provenance.
- Public repository: https://github.com/sidsri14/tracebound

## Safety and limitations

Tracebound is decision support, not autonomous remediation. The bundled data is synthetic, the deterministic sample score is not a calibrated probability, and live sponsor verification is not claimed until account-owner setup and a real end-to-end run are complete.

## Required links

- Repository: https://github.com/sidsri14/tracebound
- Slide deck (PowerPoint): https://github.com/sidsri14/tracebound/raw/refs/heads/main/docs/Tracebound-Open-Agent-Hackathon-Deck.pptx
- Slide transcript: https://github.com/sidsri14/tracebound/blob/main/docs/slide-deck.md
- Interactive HTML: https://raw.githack.com/sidsri14/tracebound/main/docs/slides.html
- Versioned release bundle: https://github.com/sidsri14/tracebound/releases/tag/v0.1.0-hackathon
- Demo video: https://github.com/sidsri14/tracebound/releases/download/v0.1.0-hackathon/Tracebound-Open-Agent-Hackathon-Demo.mp4 (2:49, 1440x900, H.264/AAC, burned-in captions)
- Demo SHA-256: `5F66F0EF3C722CF4BE3C7BA2914BBC2762E97E9F3897F4BD281E397E6BF38E18`

## Final submission gate

The pending live-sponsor disclosure is preserved, the 1-4 minute demo is rendered, release checks pass, the repository was scanned for secret patterns, and the slide deck is complete. Before creating the first HackOS submission, upload or link the demo and review any legal attestations manually. The first submission locks team composition.
