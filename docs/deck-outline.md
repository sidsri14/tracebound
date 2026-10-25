# Tracebound Deck Outline

Nine slides for a short judging deck. Use a dark operations-console palette with one amber accent for uncertainty and one cyan accent for evidence links. Keep every screenshot readable at presentation scale.

## Slide 1 - Tracebound

**Headline:** Evidence-first incident investigation

**Subhead:** An agent that can explain why a service metric changed—and show the evidence behind every claim.

**Footer:** Open Agent Hackathon 2026 · Track 2 · Siddharth Srivastava · `github.com/sidsri14/tracebound`

**Visual:** Product result panel on the right; title and one-sentence promise on the left. Keep the synthetic-data badge visible in the screenshot.

## Slide 2 - The costly gap is “why”

**Headline:** Dashboards show symptoms. Responders still have to prove cause.

**Three fragments:**

- Metrics show checkout errors rose.
- Deploy records show configuration changed.
- Runbooks and incident history hold the missing context.

**Bottom line:** A plausible model summary is not enough when omitted or contradictory evidence can change the response.

**Visual:** Four disconnected source cards flowing into a question mark: metrics, deployments, incident history, runbooks.

## Slide 3 - One answer, inspectable end to end

**Headline:** Tracebound tests alternatives before recommending action

**Result callout:** Payments timeout and retry cascade · 85.4% deterministic sample confidence · 5 supporting records · 0 contradicting records

**Competing causes:**

- Traffic spike contradicted: request volume stayed flat.
- Database saturation contradicted: utilization remained in its normal band.

**Action:** Canary the previous 3,000 ms timeout and cap retries at one.

**Visual:** Full-width product screenshot with three annotation callouts: conclusion, contradictions, reversible action.

## Slide 4 - A bounded critic loop

**Headline:** The first pass is allowed to be incomplete—not final

**Flow:** Planner → Investigator → Challenger → Evaluator → one broader retry → Synthesizer

**Rules:**

- Initial context is deliberately narrow.
- Challenger checks source diversity and uncovered hypotheses.
- Evaluator accepts or requests one retry.
- Maximum two investigation iterations.

**Visual:** Horizontal loop diagram with the retry edge emphasized. Avoid a generic “multi-agent” cloud.

## Slide 5 - Evidence that distinguishes causes

**Headline:** The conclusion emerges from support and contradiction

**Evidence chain:**

1. Deploy cut timeout from 3,000 ms to 1,500 ms and raised retries from 1 to 3.
2. Payments p95 reached 2,100 ms—above the configured timeout.
3. Retry volume rose 3.1× while request volume stayed flat.
4. Database saturation remained normal at 62%.
5. A prior incident showed the same signature.

**Visual:** Timeline from deploy to error spike, with the flat-traffic and normal-database facts shown as contradiction branches.

## Slide 6 - Sponsor stack is on the decision path

**Headline:** Data, shared context, and reasoning have explicit boundaries

**Architecture:**

- Zetaris retrieves governed evidence through bounded REST SQL.
- Meterless World Model services validate, deduplicate, rank, and explain context selection.
- Nightshift handles each live reasoning stage through its OpenAI-compatible runtime.
- NVIDIA Nemotron can be routed through Nightshift; Tracebound records the model actually returned.

**Integrity rule:** A provider failure stops live mode. Sample output is never substituted silently.

**Visual:** Four-layer architecture with request arrows and a red fail-closed boundary. Until a real sponsor run is verified, label this slide “implemented path; live verification pending.”

## Slide 7 - Working proof, not a prompt mock-up

**Headline:** Reproducible software with measurable checks

**Four numbers:**

- **9** passing automated tests
- **3** synthetic incident cases
- **2** maximum investigation iterations
- **0** production dependency vulnerabilities

**Additional proof:** TypeScript build, public MIT repository, browser UI, Docker build and API smoke test, stable evidence IDs, append-only JSONL trace.

**Visual:** Large-number grid plus the green GitHub Actions badge/link. Do not imply sponsor calls are covered by these local checks.

## Slide 8 - Why Tracebound is different

**Headline:** It explains the decision process without exposing hidden chain-of-thought

**Four properties:**

- Provenance: stable content-derived IDs and source locators.
- Falsifiability: every hypothesis can receive support and contradiction.
- Bounded reflection: one retry, never an unbounded agent loop.
- Operational safety: reversible recommendation, no automatic remediation.

**Visual:** A claim card linked to evidence IDs, contradiction markers, and a bounded retry counter.

## Slide 9 - From synthetic incident to governed operations

**Headline:** Next: verify the live sponsor path and expand governed connectors

**Near-term steps:**

1. Complete account-owner Zetaris and Nightshift setup.
2. Preserve a non-secret real end-to-end sponsor run.
3. Add governed Prometheus, deployment, and incident-system connectors.
4. Evaluate explanation quality and confidence calibration with responder-reviewed cases.

**Close:** Faster incident decisions are valuable only when responders can inspect why the agent believes them.

**Visual:** Product screenshot fading into a simple roadmap. End with the repository URL.

## Accuracy gate

- Keep “implemented path; live verification pending” until a real sponsor run succeeds.
- Call all bundled cases synthetic.
- Describe 85.4% as deterministic sample confidence, not a calibrated production probability.
- Do not claim users, deployments, response-time savings, or production impact.
- Do not add unverified prize, sponsor, or model claims.

