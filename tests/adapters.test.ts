import assert from "node:assert/strict";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { once } from "node:events";
import test from "node:test";
import { MeterlessNightshiftGenerator } from "../src/adapters/generator.js";
import { ZetarisEvidenceSource } from "../src/adapters/zetaris.js";

test("live adapters fail closed when credentials are absent", () => {
  assert.throws(() => new ZetarisEvidenceSource({ baseUrl: "", orgId: "org1", apiKey: "", sql: "select 1" }), /required/);
  assert.throws(() => new MeterlessNightshiftGenerator({ baseUrl: "", runtimeToken: "", model: "meterless\/auto", app: "test", scope: "user" }), /required/);
});

test("Nightshift completion records the actual routed model", async () => {
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({
      model: "nvidia/nemotron-test",
      choices: [{ message: { content: "Evidence-backed live explanation." } }],
    }));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const address = server.address() as AddressInfo;
    const generator = new MeterlessNightshiftGenerator({
      baseUrl: `http://127.0.0.1:${address.port}/v1`,
      runtimeToken: "test-runtime-token",
      model: "meterless/auto",
      app: "test",
      scope: "user",
    });
    const result = await generator.reflect("synthesizer", { evidenceIds: ["ev_test"] });
    assert.equal(result, "Evidence-backed live explanation.");
    assert.equal(generator.name, "meterless-nightshift:nvidia/nemotron-test");
  } finally {
    server.close();
    await once(server, "close");
  }
});

test("Zetaris adapter converts REST SQL rows into evidence", async () => {
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ rows: [{
      source_kind: "metric",
      source_name: "zetaris-test",
      locator: "row:1",
      observed_at: "2026-10-22T00:00:00.000Z",
      summary: "A traced evidence row",
      details: { value: 42 },
      claims: [],
    }] }));
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    const address = server.address() as AddressInfo;
    const source = new ZetarisEvidenceSource({
      baseUrl: `http://127.0.0.1:${address.port}/api/v1.0`,
      orgId: "org1",
      apiKey: "test-api-key",
      sql: "SELECT * FROM incident_evidence",
    });
    const rows = await source.load();
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.sourceKind, "metric");
    assert.equal(rows[0]?.summary, "A traced evidence row");
  } finally {
    server.close();
    await once(server, "close");
  }
});
