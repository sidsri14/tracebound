import { randomUUID } from "node:crypto";
import type { Generator } from "../adapters/generator.js";
import { TraceLogger } from "../logging/trace-logger.js";
import type {
  AgentTrace,
  ContextItem,
  EvidenceInput,
  Hypothesis,
  HypothesisAssessment,
  InvestigationResult,
  Scenario,
} from "../types.js";
import { ContextBuilderService } from "../world-model/context-builder.js";
import { IngestPipelineService } from "../world-model/ingest-pipeline.js";
import { WorldStoreService } from "../world-model/world-store.js";

export class InvestigationOrchestrator {
  constructor(
    private readonly generator: Generator,
    private readonly logger = new TraceLogger(),
  ) {}

  async run(scenario: Scenario, evidence: EvidenceInput[]): Promise<InvestigationResult> {
    const runId = `run_${randomUUID()}`;
    const startedAt = new Date().toISOString();
    const store = new WorldStoreService();
    const ingest = new IngestPipelineService(store);
    const contextBuilder = new ContextBuilderService(store);
    const trace: AgentTrace[] = [];
    await ingest.ingest(evidence, runId);
    await this.logger.write({ event: "run_started", runId, scenarioId: scenario.id, evidenceCount: store.size });

    const planEvidence = contextBuilder.build(scenario.question, { limit: 4 });
    await this.addTrace(trace, "planner", "Form a falsifiable investigation plan", planEvidence, {
      question: scenario.question,
      hypotheses: scenario.hypotheses,
    });

    let iterations = 0;
    let assessments: HypothesisAssessment[] = [];
    let activeContext = planEvidence;
    while (iterations < 2) {
      iterations += 1;
      assessments = assess(scenario.hypotheses, activeContext);
      await this.addTrace(trace, "investigator", `Score competing hypotheses (iteration ${iterations})`, activeContext, {
        assessments,
      });

      const gaps = findGaps(assessments, activeContext);
      await this.addTrace(trace, "challenger", "Seek contradictions and source-diversity gaps", activeContext, { gaps });
      const passed = gaps.length === 0;
      await this.addTrace(trace, "evaluator", passed ? "Accept evidence coverage" : "Request bounded retry", activeContext, {
        passed,
        gaps,
      });
      if (passed) break;
      activeContext = contextBuilder.build(
        `${scenario.question} ${gaps.join(" ")} ${scenario.hypotheses.map((item) => item.description).join(" ")}`,
        { limit: 12, requireSourceDiversity: true },
      );
    }

    assessments = assess(scenario.hypotheses, activeContext).sort((a, b) => b.confidence - a.confidence);
    const winner = assessments[0];
    if (!winner) throw new Error("Scenario requires at least one hypothesis");
    const recommendation = recommendationFor(winner, activeContext);
    const synthesis = await this.addTrace(trace, "synthesizer", "Produce a cited explanation and bounded next action", activeContext, {
      winner,
      recommendation,
    });

    const deterministicConclusion = `${winner.label} is the leading explanation. It has ${winner.supportingEvidenceIds.length} supporting and ${winner.contradictingEvidenceIds.length} contradicting evidence item(s).`;

    const result: InvestigationResult = {
      runId,
      scenarioId: scenario.id,
      question: scenario.question,
      synthetic: scenario.synthetic,
      status: "complete",
      iterations,
      conclusion: this.generator.live ? synthesis.observation : deterministicConclusion,
      confidence: winner.confidence,
      recommendedAction: recommendation,
      assessments,
      evidence: store.list(),
      trace,
      provider: this.generator.name,
      startedAt,
      completedAt: new Date().toISOString(),
    };
    await this.logger.write({ event: "run_completed", runId, confidence: result.confidence, iterations });
    return result;
  }

  private async addTrace(
    trace: AgentTrace[],
    agent: AgentTrace["agent"],
    action: string,
    context: ContextItem[],
    payload: Record<string, unknown>,
  ): Promise<AgentTrace> {
    const evidenceIds = context.map((item) => item.evidence.id);
    const evidence = context.map((item) => ({
      id: item.evidence.id,
      sourceKind: item.evidence.sourceKind,
      sourceName: item.evidence.sourceName,
      summary: item.evidence.summary,
    }));
    const observation = await this.generator.reflect(agent, { ...payload, evidenceIds, evidence });
    const entry: AgentTrace = { step: trace.length + 1, agent, action, observation, evidenceIds };
    trace.push(entry);
    await this.logger.write({ event: "agent_step", ...entry });
    return entry;
  }
}

function assess(hypotheses: Hypothesis[], context: ContextItem[]): HypothesisAssessment[] {
  return hypotheses.map((hypothesis) => {
    let supportScore = 0;
    let contradictionScore = 0;
    const supportingEvidenceIds: string[] = [];
    const contradictingEvidenceIds: string[] = [];
    for (const item of context) {
      for (const claim of item.evidence.claims ?? []) {
        if (claim.hypothesisId !== hypothesis.id) continue;
        if (claim.stance === "supports") {
          supportScore += claim.weight;
          supportingEvidenceIds.push(item.evidence.id);
        } else if (claim.stance === "contradicts") {
          contradictionScore += claim.weight;
          contradictingEvidenceIds.push(item.evidence.id);
        }
      }
    }
    const total = supportScore + contradictionScore;
    // A small prior prevents an uncontested fixture from being reported as certainty.
    const confidence = total === 0 ? 0 : Number((supportScore / (total + 0.75)).toFixed(3));
    return {
      ...hypothesis,
      supportScore: Number(supportScore.toFixed(3)),
      contradictionScore: Number(contradictionScore.toFixed(3)),
      confidence,
      supportingEvidenceIds: [...new Set(supportingEvidenceIds)],
      contradictingEvidenceIds: [...new Set(contradictingEvidenceIds)],
    };
  });
}

function findGaps(assessments: HypothesisAssessment[], context: ContextItem[]): string[] {
  const gaps: string[] = [];
  const kinds = new Set(context.map((item) => item.evidence.sourceKind));
  if (kinds.size < 4) gaps.push("include metric, deployment, incident, and runbook sources");
  for (const assessment of assessments) {
    if (assessment.supportingEvidenceIds.length + assessment.contradictingEvidenceIds.length === 0) {
      gaps.push(`find evidence for ${assessment.id}`);
    }
  }
  return gaps;
}

function recommendationFor(winner: HypothesisAssessment, context: ContextItem[]): string {
  const runbook = context.find((item) => item.evidence.sourceKind === "runbook");
  const action = runbook?.evidence.details.recommendedAction;
  if (typeof action === "string") return `${action} Validate the change against the cited metrics before broad rollout.`;
  return `Run a reversible test targeting “${winner.label}”, then compare the same evidence signals before and after.`;
}
