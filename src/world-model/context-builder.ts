import type { ContextItem, EvidenceRecord } from "../types.js";
import { WorldStoreService } from "./world-store.js";

export class ContextBuilderService {
  constructor(private readonly store: WorldStoreService) {}

  build(query: string, options: { limit?: number; requireSourceDiversity?: boolean } = {}): ContextItem[] {
    const limit = options.limit ?? 8;
    const tokens = tokenize(query);
    const scored = this.store.list().map((evidence) => scoreEvidence(evidence, tokens));
    scored.sort((a, b) => b.relevance - a.relevance || a.evidence.id.localeCompare(b.evidence.id));

    if (!options.requireSourceDiversity) return scored.slice(0, limit);

    const selected: ContextItem[] = [];
    const seenKinds = new Set<string>();
    for (const item of scored) {
      if (!seenKinds.has(item.evidence.sourceKind)) {
        selected.push({ ...item, selectionReason: `${item.selectionReason}; source-diversity slot` });
        seenKinds.add(item.evidence.sourceKind);
      }
      if (selected.length >= limit) return selected;
    }
    for (const item of scored) {
      if (!selected.some((candidate) => candidate.evidence.id === item.evidence.id)) selected.push(item);
      if (selected.length >= limit) break;
    }
    return selected;
  }
}

function scoreEvidence(evidence: EvidenceRecord, tokens: Set<string>): ContextItem {
  const haystack = tokenize(`${evidence.summary} ${JSON.stringify(evidence.details)} ${evidence.sourceKind}`);
  const matches = [...tokens].filter((token) => haystack.has(token)).length;
  const claimBoost = (evidence.claims ?? []).length * 0.25;
  const relevance = Number((matches / Math.max(tokens.size, 1) + claimBoost).toFixed(4));
  return {
    evidence,
    relevance,
    selectionReason: matches > 0 ? `${matches} query token match(es)` : "claim-bearing fallback",
  };
}

function tokenize(value: string): Set<string> {
  return new Set(value.toLowerCase().match(/[a-z0-9]+/g)?.filter((token) => token.length > 2) ?? []);
}
