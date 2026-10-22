import { setTimeout as delay } from "node:timers/promises";

export type AgentStage = "planner" | "investigator" | "challenger" | "evaluator" | "synthesizer";

export interface Generator {
  readonly name: string;
  readonly live: boolean;
  reflect(stage: AgentStage, payload: Record<string, unknown>): Promise<string>;
}

export class DeterministicSampleGenerator implements Generator {
  readonly name = "deterministic-sample";
  readonly live = false;

  async reflect(stage: AgentStage, payload: Record<string, unknown>): Promise<string> {
    const evidenceCount = Array.isArray(payload.evidenceIds) ? payload.evidenceIds.length : 0;
    return `${stage} completed against ${evidenceCount} cited evidence record(s); sample mode made no network call.`;
  }
}

export interface NightshiftConfig {
  baseUrl: string;
  runtimeToken: string;
  model: string;
  app: string;
  scope: string;
  timeoutMs?: number;
  retries?: number;
}

export class MeterlessNightshiftGenerator implements Generator {
  readonly live = true;
  private resolvedModel?: string;
  private readonly timeoutMs: number;
  private readonly retries: number;

  constructor(private readonly config: NightshiftConfig) {
    requireValue(config.baseUrl, "NIGHTSHIFT_BASE_URL");
    requireValue(config.runtimeToken, "NIGHTSHIFT_RUNTIME_TOKEN");
    requireValue(config.model, "NIGHTSHIFT_MODEL");
    this.timeoutMs = config.timeoutMs ?? 20_000;
    this.retries = config.retries ?? 1;
  }

  get name(): string {
    return `meterless-nightshift:${this.resolvedModel ?? this.config.model}`;
  }

  async reflect(stage: AgentStage, payload: Record<string, unknown>): Promise<string> {
    const endpoint = `${this.config.baseUrl.replace(/\/$/, "")}/chat/completions`;
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
            authorization: `Bearer ${this.config.runtimeToken}`,
            "meterless-app": this.config.app,
            "meterless-scope": this.config.scope,
          },
          body: JSON.stringify({
            model: this.config.model,
            temperature: 0.1,
            messages: [
              {
                role: "system",
                content: "You are one stage in an evidence-first incident investigation. Be concise. Never invent evidence IDs.",
              },
              { role: "user", content: JSON.stringify({ stage, ...payload }) },
            ],
          }),
        });
        if (!response.ok) throw new Error(`Nightshift returned HTTP ${response.status}`);
        const body = (await response.json()) as {
          model?: string;
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = body.choices?.[0]?.message?.content?.trim();
        if (!content) throw new Error("Nightshift returned no completion content");
        if (body.model) this.resolvedModel = body.model;
        return content;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.retries) await delay(250 * 2 ** attempt);
      } finally {
        clearTimeout(timer);
      }
    }
    throw new Error(`Nightshift request failed: ${lastError?.message ?? "unknown error"}`);
  }
}

function requireValue(value: string, name: string): void {
  if (!value || value.includes("replace-with")) throw new Error(`${name} is required for live mode`);
}
