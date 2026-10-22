import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { EvidenceRecord } from "../types.js";

export class WorldStoreService {
  private readonly records = new Map<string, EvidenceRecord>();

  constructor(private readonly appendLogPath?: string) {}

  async append(record: EvidenceRecord): Promise<boolean> {
    const existing = this.records.get(record.id);
    if (existing) {
      if (existing.digest !== record.digest) throw new Error(`Evidence ID collision: ${record.id}`);
      return false;
    }
    this.records.set(record.id, record);
    if (this.appendLogPath) {
      await mkdir(dirname(this.appendLogPath), { recursive: true });
      await appendFile(this.appendLogPath, `${JSON.stringify(record)}\n`, "utf8");
    }
    return true;
  }

  list(): EvidenceRecord[] {
    return [...this.records.values()].sort((a, b) => a.observedAt.localeCompare(b.observedAt));
  }

  get(id: string): EvidenceRecord | undefined {
    return this.records.get(id);
  }

  get size(): number {
    return this.records.size;
  }
}
