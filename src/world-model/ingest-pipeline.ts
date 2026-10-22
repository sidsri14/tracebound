import type { EvidenceInput, EvidenceRecord } from "../types.js";
import { digest, stableId } from "../util/stable-id.js";
import { WorldStoreService } from "./world-store.js";

export interface IngestResult {
  accepted: number;
  duplicates: number;
  ids: string[];
}

export class IngestPipelineService {
  constructor(private readonly store: WorldStoreService) {}

  async ingest(inputs: EvidenceInput[], runId: string, agent = "ingest-pipeline"): Promise<IngestResult> {
    let accepted = 0;
    let duplicates = 0;
    const ids: string[] = [];

    for (const input of inputs) {
      validate(input);
      const identity = {
        sourceKind: input.sourceKind,
        sourceName: input.sourceName,
        locator: input.locator,
        observedAt: input.observedAt,
        summary: input.summary,
        details: input.details,
        claims: input.claims ?? [],
      };
      const record: EvidenceRecord = {
        ...input,
        id: stableId("ev", identity),
        digest: digest(identity),
        ingestedAt: new Date().toISOString(),
        runId,
        agent,
      };
      ids.push(record.id);
      if (await this.store.append(record)) accepted += 1;
      else duplicates += 1;
    }
    return { accepted, duplicates, ids };
  }
}

function validate(input: EvidenceInput): void {
  if (!input.sourceName.trim() || !input.locator.trim() || !input.summary.trim()) {
    throw new Error("Evidence requires sourceName, locator, and summary");
  }
  if (Number.isNaN(Date.parse(input.observedAt))) throw new Error(`Invalid observedAt: ${input.observedAt}`);
  for (const claim of input.claims ?? []) {
    if (claim.weight < 0 || claim.weight > 1) throw new Error("Claim weight must be between 0 and 1");
  }
}
