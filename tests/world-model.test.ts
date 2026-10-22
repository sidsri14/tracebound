import assert from "node:assert/strict";
import test from "node:test";
import type { EvidenceInput } from "../src/types.js";
import { ContextBuilderService } from "../src/world-model/context-builder.js";
import { IngestPipelineService } from "../src/world-model/ingest-pipeline.js";
import { WorldStoreService } from "../src/world-model/world-store.js";

const evidence: EvidenceInput = {
  sourceKind: "metric",
  sourceName: "test-metrics",
  locator: "metric:one",
  observedAt: "2026-10-22T10:00:00.000Z",
  summary: "Checkout errors increased",
  details: { errors: 10 },
  claims: [{ hypothesisId: "h1", stance: "supports", weight: 0.8 }],
};

test("ingest is stable and idempotent", async () => {
  const store = new WorldStoreService();
  const pipeline = new IngestPipelineService(store);
  const first = await pipeline.ingest([evidence], "run-1");
  const second = await pipeline.ingest([evidence], "run-2");
  assert.equal(first.accepted, 1);
  assert.equal(second.duplicates, 1);
  assert.equal(first.ids[0], second.ids[0]);
  assert.equal(store.size, 1);
});

test("context includes an explicit selection reason", async () => {
  const store = new WorldStoreService();
  await new IngestPipelineService(store).ingest([evidence], "run-1");
  const context = new ContextBuilderService(store).build("checkout errors");
  assert.equal(context.length, 1);
  assert.match(context[0]?.selectionReason ?? "", /query token/);
});
