# Tracebound Demo Script

Target length: 3 minutes. The bundled incident and every displayed record are synthetic.

## Before recording

```bash
npm install
npm test
npm run typecheck
npm run build
npm run sample
npm run dev
```

Open `http://127.0.0.1:3000` and select the checkout scenario. If the sponsor-backed live run has not been verified, record sample mode and say so explicitly. Never put credentials, environment files, provider consoles, or raw authorization headers on screen.

## 0:00-0:20 - Problem

**Narration**

> During an incident, the difficult question is not what changed; it is why. Metrics, deploy records, earlier incidents, and runbooks live in separate systems, and a plausible first explanation can still be wrong. Tracebound is an evidence-first investigation agent that tests competing causes before recommending a reversible action.

**Visual**

- Show the incident question and three competing hypotheses.
- Keep the synthetic-data badge visible.

## 0:20-0:50 - World Model and provenance

**Narration**

> Tracebound ingests every record into a shared World Model. Each item receives a stable content-derived ID, digest, source locator, observation time, and agent attribution. The same record cannot be silently duplicated, and every later claim points back to these IDs.

**Visual**

- Open the evidence panel.
- Highlight the deployment, latency metric, retry metric, normal database saturation, prior incident, and runbook records.
- Briefly show one stable `ev_...` identifier and its source locator.

## 0:50-1:35 - Bounded agent loop

**Narration**

> A Planner begins with a deliberately narrow evidence slice. The Investigator scores every hypothesis from explicit support and contradiction links. The Challenger finds missing source types and uncovered alternatives. Here, the Evaluator rejects the first pass and allows one broader retry. The second pass incorporates all seven records, then stops. The loop is bounded at two investigations, so it cannot spin indefinitely.

**Visual**

- Run the investigation.
- Step through Planner, Investigator, Challenger, Evaluator, retry, and Synthesizer.
- Pause on iteration count `2` and the seven cited evidence IDs.

## 1:35-2:15 - Explanation, not just an answer

**Narration**

> The leading explanation is a payments timeout and retry cascade. A deployment cut the timeout from 3,000 to 1,500 milliseconds and raised retries from one to three. Payments p95 then reached 2,100 milliseconds, retry volume rose 3.1 times while traffic stayed flat, and database saturation remained normal. Tracebound therefore supports one cause while explicitly contradicting the traffic-spike and database-saturation alternatives.

**Visual**

- Show the 85.4% sample confidence and five supporting records.
- Expand the two contradicted alternatives.
- Point to the reversible recommendation: canary the previous timeout and cap retries at one.

## 2:15-2:45 - Sponsor path

Use exactly one of these variants.

**After a verified live run**

> In live mode, Zetaris is the data layer: Tracebound retrieves governed evidence through a bounded SQL request. The Meterless World Model services build the shared context. Nightshift handles every reasoning stage through its OpenAI-compatible runtime, and Tracebound records the actual routed model, including NVIDIA Nemotron when configured. Any sponsor failure stops the run; it never falls back to sample output.

**Before live verification**

> The repository includes fail-closed Zetaris and Meterless Nightshift adapters plus integration tests with local fake services. Live sponsor verification is still pending account-owner setup, so this recording makes no claim that a real sponsor call succeeded.

**Visual**

- Show the architecture diagram or sponsor-integration document.
- For a verified live run only, show the non-secret provider/model fields from the result.

## 2:45-3:00 - Close

**Narration**

> Tracebound makes an incident conclusion inspectable: what evidence was selected, what contradicted each alternative, why a retry happened, and which bounded action follows. The public repository includes three synthetic cases, nine tests, Docker support, and a complete audit trail.

**Visual**

- End on the final explanation and repository URL.

## Recording acceptance checks

- Length is between 1 and 4 minutes.
- Text and evidence IDs are readable at 1080p or better.
- Audio contains no unsupported claim of production use or live sponsor verification.
- The synthetic-data label is visible.
- No secrets, personal email, OTP, API key, token, or local `.env` value appears.
- The final frame includes `https://github.com/sidsri14/tracebound`.

