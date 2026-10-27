# Tracebound Demo Narration

The recording uses the bundled synthetic checkout incident in deterministic sample mode. Live Zetaris, Meterless Nightshift, and NVIDIA provider calls are not claimed.

1. Tracebound is an evidence-first incident investigation agent built for the Open Agent Hackathon track, The Agent That Can Explain Why.
2. During an incident, metrics, deployments, earlier incidents, and runbooks live in separate systems. A plausible explanation is not enough unless responders can inspect what supports it and what contradicts the alternatives.
3. This demo uses clearly labeled synthetic data and deterministic sample mode. Tracebound never presents the sample score as a production probability and never executes remediation.
4. When the investigation starts, every record enters a shared World Model with a stable content-derived identifier, a SHA-256 digest, source type, locator, observation time, and agent attribution.
5. The same evidence cannot be silently duplicated. Every later claim links back to the exact records selected for that run.
6. A Planner begins with a deliberately narrow four-record slice. The Investigator scores all three competing hypotheses from explicit support and contradiction links.
7. The Challenger detects missing source types and uncovered alternatives. The Evaluator rejects that incomplete first pass and allows exactly one broader retry.
8. On iteration two, the investigation uses all seven records and stops. The bounded loop cannot spin indefinitely.
9. The leading explanation is a payments timeout and retry cascade. A deployment reduced the timeout from three thousand to fifteen hundred milliseconds and raised retries from one to three.
10. Payments p95 reached twenty-one hundred milliseconds and retry volume rose three point one times while traffic stayed flat. Database saturation remained normal.
11. Tracebound therefore supports the timeout-and-retry cause while explicitly contradicting the traffic-spike and database-saturation alternatives.
12. The recommended action is reversible: canary the previous timeout, cap retries at one, and validate the change against the cited metrics before broad rollout.
13. The repository includes a fail-closed Zetaris REST SQL adapter, Meterless World Model services, and a fail-closed Nightshift OpenAI-compatible adapter. NVIDIA can be configured behind Nightshift.
14. Live sponsor verification is still pending account-owner setup, so this recording does not claim that a real Zetaris, Nightshift, or NVIDIA call succeeded.
15. Fresh release checks pass nine tests, TypeScript type checking, the production build, a dependency audit with zero vulnerabilities, an API smoke run, and a secret-pattern scan.
16. Tracebound makes the investigation inspectable: what was selected, which alternatives were contradicted, why a retry happened, and which bounded action follows. The code, deck, architecture notes, and three synthetic cases are public at github dot com slash sidsri fourteen slash tracebound.
