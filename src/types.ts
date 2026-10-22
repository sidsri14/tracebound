export type SourceKind = "metric" | "deployment" | "incident" | "runbook" | "other";
export type Stance = "supports" | "contradicts" | "context";

export interface EvidenceClaim {
  hypothesisId: string;
  stance: Stance;
  weight: number;
}

export interface EvidenceInput {
  sourceKind: SourceKind;
  sourceName: string;
  locator: string;
  observedAt: string;
  summary: string;
  details: Record<string, unknown>;
  claims?: EvidenceClaim[];
}

export interface EvidenceRecord extends EvidenceInput {
  id: string;
  digest: string;
  ingestedAt: string;
  runId: string;
  agent: string;
}

export interface Hypothesis {
  id: string;
  label: string;
  description: string;
}

export interface Scenario {
  id: string;
  title: string;
  question: string;
  synthetic: boolean;
  evidenceFiles: string[];
  hypotheses: Hypothesis[];
}

export interface ContextItem {
  evidence: EvidenceRecord;
  relevance: number;
  selectionReason: string;
}

export interface HypothesisAssessment extends Hypothesis {
  supportScore: number;
  contradictionScore: number;
  confidence: number;
  supportingEvidenceIds: string[];
  contradictingEvidenceIds: string[];
}

export interface AgentTrace {
  step: number;
  agent: "planner" | "investigator" | "challenger" | "evaluator" | "synthesizer";
  action: string;
  observation: string;
  evidenceIds: string[];
}

export interface InvestigationResult {
  runId: string;
  scenarioId: string;
  question: string;
  synthetic: boolean;
  status: "complete";
  iterations: number;
  conclusion: string;
  confidence: number;
  recommendedAction: string;
  assessments: HypothesisAssessment[];
  evidence: EvidenceRecord[];
  trace: AgentTrace[];
  provider: string;
  startedAt: string;
  completedAt: string;
}
