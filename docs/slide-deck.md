# Tracebound - Open Agent Hackathon Deck

**Event:** Open Agent Hackathon 2026

**Track:** The Agent That Can Explain Why

**Project:** Tracebound - Evidence-First Incident Investigation

**Author:** Siddharth Srivastava (`@sidsri14`)

**Repository:** https://github.com/sidsri14/tracebound

The downloadable PowerPoint is `docs/Tracebound-Open-Agent-Hackathon-Deck.pptx`.

## Accuracy boundary

- Every bundled incident is synthetic.
- `85.4%` is deterministic sample confidence, not a calibrated production probability.
- Sponsor adapters and hermetic tests are implemented; a real Zetaris/Nightshift/NVIDIA end-to-end run remains pending account-owner setup.
- Tracebound recommends a reversible action. It never executes remediation.

---

## Slide 1 - Do not just name the cause. Show why.

Tracebound is an evidence-first incident agent that tests competing explanations, preserves provenance, and recommends a reversible next step.

The sample result is a payments timeout and retry cascade with five supporting records and no contradicting record.

---

## Slide 2 - Symptoms arrive fast. Proof does not.

Operational truth is fragmented across metrics, deployments, incident history, and runbooks. A dashboard can show that checkout errors rose, but it cannot prove whether the cause was a deploy, traffic spike, database saturation, or a downstream dependency.

A plausible summary is not enough when omitted evidence changes the response.

---

## Slide 3 - One answer stays inspectable.

The bundled synthetic checkout case returns:

- Leading explanation: payments timeout and retry cascade.
- Deterministic sample confidence: `85.4%`.
- Evidence: five supporting records and no contradicting record for the winning hypothesis.
- Reversible action: canary the previous 3,000 ms timeout and cap retries at one.

The product screenshot shows the competing hypotheses, complete agent audit trail, and cited evidence IDs.

---

## Slide 4 - The first pass is not the final answer.

Tracebound uses a bounded sequence:

1. Planner forms a falsifiable plan.
2. Investigator scores competing hypotheses.
3. Challenger finds evidence gaps and contradictions.
4. Evaluator accepts the evidence or requests one broader retry.
5. Synthesizer emits the cited explanation and reversible action.

There are at most two investigation passes. The system never enters an unbounded reflection loop.

---

## Slide 5 - Support and contradiction separate the cause.

The winning evidence chain is:

1. A deployment reduced the payments timeout from 3,000 ms to 1,500 ms and increased retries from one to three.
2. Payments p95 latency reached 2,100 ms, crossing the new timeout.
3. Retry volume rose 3.1x while request volume stayed flat.

Two alternatives are contradicted:

- Unexpected traffic spike: request volume stayed flat.
- Primary database saturation: utilization remained in its normal band at 62%.

The best explanation must survive alternatives, not merely sound plausible.

---

## Slide 6 - Sponsor technology sits on the decision path.

- **Zetaris:** retrieves governed evidence through bounded REST SQL.
- **Meterless World Model Engine:** validates, deduplicates, ranks, and explains context selection.
- **Meterless Nightshift:** runs each live reasoning stage through its OpenAI-compatible runtime.
- **NVIDIA route:** Tracebound records the model actually returned and never assumes a Nemotron route.

Implementation status: adapters and hermetic tests are complete. Live end-to-end account verification is pending. If a provider fails, live mode stops; sample output is never substituted silently.

---

## Slide 7 - Reproducible software, not a mock-up.

- Nine passing automated tests.
- Three synthetic incident cases.
- Two maximum investigation passes.
- Zero production dependency vulnerabilities.

Additional proof includes a passing TypeScript build and typecheck, browser UI, public MIT repository, Docker/API smoke verification, stable evidence IDs, and an append-only JSONL trace.

These local checks do not claim that live sponsor calls have been completed.

---

## Slide 8 - Evidence is visible. Hidden reasoning stays private.

- **Provenance:** stable content-derived IDs and source locators keep claims traceable.
- **Falsifiability:** every hypothesis can receive supporting and contradicting evidence.
- **Bounded reflection:** one broader retry improves coverage without an unbounded agent loop.
- **Operational safety:** the recommendation is reversible and Tracebound never executes remediation.

---

## Slide 9 - If you cannot inspect why, do not act.

Tracebound turns a plausible explanation into a testable decision record:

- Explain by linking every claim to evidence and provenance.
- Challenge competing causes before accepting an answer.
- Act safely by recommending the smallest reversible next step.

Next: verify a non-secret live sponsor run, then extend governed connectors.
