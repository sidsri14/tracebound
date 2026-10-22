import assert from "node:assert/strict";
import test from "node:test";
import { MeterlessNightshiftGenerator } from "../src/adapters/generator.js";
import { ZetarisEvidenceSource } from "../src/adapters/zetaris.js";

test("live adapters fail closed when credentials are absent", () => {
  assert.throws(() => new ZetarisEvidenceSource({ baseUrl: "", orgId: "org1", apiKey: "", sql: "select 1" }), /required/);
  assert.throws(() => new MeterlessNightshiftGenerator({ baseUrl: "", runtimeToken: "", model: "meterless\/auto", app: "test", scope: "user" }), /required/);
});
