import assert from "node:assert/strict";
import test from "node:test";
import { DeterministicSampleGenerator } from "../src/adapters/generator.js";
import { loadScenario } from "../src/adapters/sample-data.js";
import { InvestigationOrchestrator } from "../src/agents/orchestrator.js";

test("sample investigation challenges the first pass and cites the winning hypothesis", async () => {
  const { scenario, evidence } = await loadScenario("data/sample/scenario.json");
  const result = await new InvestigationOrchestrator(new DeterministicSampleGenerator()).run(scenario, evidence);
  assert.equal(result.synthetic, true);
  assert.equal(result.iterations, 2);
  assert.equal(result.assessments[0]?.id, "timeout-retry-cascade");
  assert.ok((result.assessments[0]?.supportingEvidenceIds.length ?? 0) >= 3);
  assert.ok(result.trace.some((entry) => entry.agent === "challenger"));
  assert.ok(result.trace.every((entry) => entry.evidenceIds.length > 0));
});

for (const [path, winner] of [
  ["examples/inputs/catalog-cache.json", "cache-bypass"],
  ["examples/inputs/auth-dns.json", "resolver-migration"],
] as const) {
  test(`investigates additional synthetic case: ${winner}`, async () => {
    const { scenario, evidence } = await loadScenario(path);
    const result = await new InvestigationOrchestrator(new DeterministicSampleGenerator()).run(scenario, evidence);
    assert.equal(result.assessments[0]?.id, winner);
    assert.equal(result.iterations, 2);
    assert.ok(result.confidence < 1);
  });
}
