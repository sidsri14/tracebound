import { randomUUID } from "node:crypto";
import { setTimeout as delay } from "node:timers/promises";
import type { EvidenceInput } from "../types.js";

export interface ZetarisConfig {
  baseUrl: string;
  orgId: string;
  apiKey: string;
  sql: string;
  timeoutMs?: number;
  retries?: number;
}

export class ZetarisEvidenceSource {
  private readonly timeoutMs: number;
  private readonly retries: number;

  constructor(private readonly config: ZetarisConfig) {
    for (const [name, value] of Object.entries({
      ZETARIS_BASE_URL: config.baseUrl,
      ZETARIS_ORG_ID: config.orgId,
      ZETARIS_API_KEY: config.apiKey,
      ZETARIS_SQL: config.sql,
    })) {
      if (!value || value.includes("replace-with")) throw new Error(`${name} is required for live mode`);
    }
    this.timeoutMs = config.timeoutMs ?? 20_000;
    this.retries = config.retries ?? 1;
  }

  async load(): Promise<EvidenceInput[]> {
    const endpoint = `${this.config.baseUrl.replace(/\/$/, "")}/sql-editor/sqls/run`;
    let lastError: Error | undefined;
    for (let attempt = 0; attempt <= this.retries; attempt += 1) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${this.config.apiKey}`,
            "X-Org-ID": this.config.orgId,
            "X-Request-ID": randomUUID(),
          },
          body: JSON.stringify({ sql: this.config.sql }),
        });
        if (!response.ok) throw new Error(`Zetaris returned HTTP ${response.status}`);
        const body = (await response.json()) as unknown;
        const rows = extractRows(body);
        return rows.map(toEvidence);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.retries) await delay(250 * 2 ** attempt);
      } finally {
        clearTimeout(timer);
      }
    }
    throw new Error(`Zetaris request failed: ${lastError?.message ?? "unknown error"}`);
  }
}

function extractRows(body: unknown): Record<string, unknown>[] {
  if (Array.isArray(body)) return body as Record<string, unknown>[];
  if (!body || typeof body !== "object") throw new Error("Zetaris response was not an object or array");
  const object = body as Record<string, unknown>;
  for (const candidate of [object.rows, object.data, object.result]) {
    if (Array.isArray(candidate)) return candidate as Record<string, unknown>[];
  }
  throw new Error("Zetaris response did not contain a rows, data, or result array");
}

function toEvidence(row: Record<string, unknown>, index: number): EvidenceInput {
  const sourceKind = String(row.sourceKind ?? row.source_kind ?? "other");
  const allowed = new Set(["metric", "deployment", "incident", "runbook", "other"]);
  return {
    sourceKind: allowed.has(sourceKind) ? (sourceKind as EvidenceInput["sourceKind"]) : "other",
    sourceName: String(row.sourceName ?? row.source_name ?? "zetaris"),
    locator: String(row.locator ?? `zetaris:row:${index}`),
    observedAt: String(row.observedAt ?? row.observed_at ?? new Date(0).toISOString()),
    summary: String(row.summary ?? "Zetaris evidence row"),
    details: (row.details && typeof row.details === "object" ? row.details : row) as Record<string, unknown>,
    claims: Array.isArray(row.claims) ? (row.claims as NonNullable<EvidenceInput["claims"]>) : [],
  };
}
