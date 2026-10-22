import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import type { EvidenceInput, Scenario } from "../types.js";

export async function loadScenario(path: string): Promise<{ scenario: Scenario; evidence: EvidenceInput[] }> {
  const absolute = resolve(path);
  const scenario = JSON.parse(await readFile(absolute, "utf8")) as Scenario;
  if (!scenario.synthetic) throw new Error("Bundled sample scenarios must be explicitly marked synthetic");
  const evidence: EvidenceInput[] = [];
  for (const relativePath of scenario.evidenceFiles) {
    const rows = JSON.parse(await readFile(resolve(dirname(absolute), relativePath), "utf8")) as EvidenceInput[];
    evidence.push(...rows);
  }
  return { scenario, evidence };
}
