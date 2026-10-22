# Architecture

## Runtime sequence

1. The ingest pipeline validates source records, derives a canonical digest and stable ID, and appends unseen records to the World Model.
2. The context builder ranks records against the investigation question and explains each selection.
3. The Planner starts with a deliberately narrow evidence slice.
4. The Investigator scores every competing hypothesis from explicit supporting and contradicting records.
5. The Challenger checks hypothesis coverage and source diversity.
6. The Evaluator either accepts the evidence or requests one broader, source-diverse retry.
7. The Synthesizer names the leading explanation, reports uncertainty, and proposes a reversible runbook action.

The retry is bounded at two investigation iterations so a provider or bad evidence set cannot create an unbounded loop.

## Trust boundaries

Zetaris and Nightshift are external runtime boundaries. Their adapters validate configuration, enforce timeouts, use one retry, and surface failure. Sample mode never contacts them. The browser only talks to Tracebound's local HTTP API and never receives sponsor credentials.

## Auditability

The output contains every evidence record and every agent step. Each step lists its evidence IDs, while the World Model preserves source locators and ingestion attribution. JSONL operational logs redact fields whose names resemble secrets.
