import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";

export class TraceLogger {
  constructor(private readonly path?: string) {}

  async write(event: Record<string, unknown>): Promise<void> {
    if (!this.path) return;
    await mkdir(dirname(this.path), { recursive: true });
    const safeEvent = redact(event) as Record<string, unknown>;
    await appendFile(this.path, `${JSON.stringify({ at: new Date().toISOString(), ...safeEvent })}\n`, "utf8");
  }
}

function redact(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [
        key,
        /token|secret|password|api.?key|authorization/i.test(key) ? "[REDACTED]" : redact(item),
      ]),
    );
  }
  return value;
}
