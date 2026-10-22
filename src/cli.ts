import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { runInvestigation, type RunMode } from "./runtime.js";

const args = parseArgs(process.argv.slice(2));
const mode = (args.mode ?? "sample") as RunMode;
if (mode !== "sample" && mode !== "live") throw new Error("--mode must be sample or live");
const scenario = args.scenario ?? "data/sample/scenario.json";
const output = resolve(args.output ?? "output/run.json");

const result = await runInvestigation(mode, scenario);
await mkdir(dirname(output), { recursive: true });
await writeFile(output, `${JSON.stringify(result, null, 2)}\n`, "utf8");
console.log(JSON.stringify({
  status: result.status,
  runId: result.runId,
  mode,
  conclusion: result.conclusion,
  confidence: result.confidence,
  iterations: result.iterations,
  output,
}, null, 2));

function parseArgs(values: string[]): Record<string, string> {
  const parsed: Record<string, string> = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value?.startsWith("--")) continue;
    const next = values[index + 1];
    if (!next || next.startsWith("--")) throw new Error(`Missing value for ${value}`);
    parsed[value.slice(2)] = next;
    index += 1;
  }
  return parsed;
}
