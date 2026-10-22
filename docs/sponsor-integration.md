# Sponsor integration

## Zetaris data layer

`ZetarisEvidenceSource` calls:

```text
POST {ZETARIS_BASE_URL}/sql-editor/sqls/run
Authorization: Bearer {ZETARIS_API_KEY}
X-Org-ID: {ZETARIS_ORG_ID}
X-Request-ID: <random UUID>
```

The configured SQL should return evidence-shaped rows. The adapter accepts a top-level array or a `rows`, `data`, or `result` array. Configure the API at `http://localhost:8888/api/v1.0` for the documented local setup.

## Meterless World Model Engine

The repository implements the engine interfaces directly:

- `WorldStoreService`: append-only, duplicate-safe evidence state;
- `IngestPipelineService`: validation, canonical hashes, provenance, resumable ingest;
- `ContextBuilderService`: ranked context with source diversity and selection reasons.

The generator is injected, so World Model storage and retrieval do not depend on a specific model provider.

## Meterless Nightshift

`MeterlessNightshiftGenerator` calls the OpenAI-compatible endpoint:

```text
POST {NIGHTSHIFT_BASE_URL}/chat/completions
Authorization: Bearer {NIGHTSHIFT_RUNTIME_TOKEN}
meterless-app: tracebound
meterless-scope: user
```

The default documented model is `meterless/auto`. NVIDIA provider keys are configured inside Nightshift; Tracebound receives only the local Nightshift runtime token. This keeps provider credentials out of the application and repository.

## Verification status

The adapters and fail-closed behavior are covered by local tests. End-to-end sponsor calls remain pending account-owner setup of Zetaris and Nightshift credentials. This distinction is intentional: the repository does not claim an integration was live-tested before it was.
