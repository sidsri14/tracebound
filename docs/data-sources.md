# Data sources

The bundled incident is synthetic and split across four files to reproduce fragmented operational context:

| File | Source type | Purpose |
| --- | --- | --- |
| `metrics.json` | Metrics | Error rate, latency, retries, request volume, database saturation |
| `deployments.json` | Deployment | The configuration change immediately preceding the regression |
| `incident-history.json` | Incident archive | A comparable historical signature and resolution |
| `runbook.json` | Runbook | A bounded, reversible next action |

Claims in these fixtures are test annotations, not model-generated facts. In live mode Zetaris supplies records. Production connectors should preserve the upstream locator, observation timestamp, and governance metadata needed to audit each claim.
