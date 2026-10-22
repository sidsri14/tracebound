# Data

Tracebound includes seven small, synthetic evidence records for its primary checkout incident. They were authored during the hackathon build window and do not contain personal, customer, or production data.

| File | Records | Purpose |
| --- | ---: | --- |
| `sample/metrics.json` | 4 | Checkout errors, payments latency, retry volume, traffic, and database saturation |
| `sample/deployments.json` | 1 | The preceding timeout/retry configuration change |
| `sample/incident-history.json` | 1 | A comparable historical signature |
| `sample/runbook.json` | 1 | A bounded, reversible response |

License: these fixtures are part of this repository and available under its MIT license.

The local demo serves the records at `GET /api/evidence` as `{ "synthetic": true, "rows": [...] }`. For live-mode verification, register `http://host.docker.internal:3000/api/evidence` as a REST source in the locally installed Zetaris instance, map the `rows` array, and expose the resulting source as `incident_evidence`. Set `ZETARIS_SQL` to the verified query for that source.

No download or regeneration step is required. Modify the JSON fixtures to create new synthetic scenarios, keeping `synthetic: true` in the scenario manifest and retaining explicit source locators and timestamps.

Limitations: claim annotations are deterministic test labels, not model judgments or calibrated ground truth. A production connector must preserve upstream provenance and comply with the source system's access and retention policies.
