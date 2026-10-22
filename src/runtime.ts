import { MeterlessNightshiftGenerator, DeterministicSampleGenerator } from "./adapters/generator.js";
import { loadScenario } from "./adapters/sample-data.js";
import { ZetarisEvidenceSource } from "./adapters/zetaris.js";
import { InvestigationOrchestrator } from "./agents/orchestrator.js";
import { TraceLogger } from "./logging/trace-logger.js";
import type { InvestigationResult } from "./types.js";

export type RunMode = "sample" | "live";

export async function runInvestigation(mode: RunMode, scenarioPath: string): Promise<InvestigationResult> {
  const { scenario, evidence: sampleEvidence } = await loadScenario(scenarioPath);
  if (mode === "sample") {
    return new InvestigationOrchestrator(
      new DeterministicSampleGenerator(),
      new TraceLogger("logs/trace.jsonl"),
    ).run(scenario, sampleEvidence);
  }

  const zetaris = new ZetarisEvidenceSource({
    baseUrl: required("ZETARIS_BASE_URL"),
    orgId: required("ZETARIS_ORG_ID"),
    apiKey: required("ZETARIS_API_KEY"),
    sql: required("ZETARIS_SQL"),
  });
  const generator = new MeterlessNightshiftGenerator({
    baseUrl: required("NIGHTSHIFT_BASE_URL"),
    runtimeToken: required("NIGHTSHIFT_RUNTIME_TOKEN"),
    model: required("NIGHTSHIFT_MODEL"),
    app: process.env.NIGHTSHIFT_APP ?? "tracebound",
    scope: process.env.NIGHTSHIFT_SCOPE ?? "user",
  });
  const evidence = await zetaris.load();
  return new InvestigationOrchestrator(generator, new TraceLogger("logs/trace.jsonl")).run(scenario, evidence);
}

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.includes("replace-with")) throw new Error(`${name} is required for live mode`);
  return value;
}
