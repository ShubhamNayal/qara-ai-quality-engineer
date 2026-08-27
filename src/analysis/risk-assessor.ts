import {
  classifyChange,
  type ClassificationResult,
} from "./classifier.js";

import {
  getRiskDecision,
  type RiskDecision,
} from "./risk-decision.js";

import {
  detectRiskSignals,
} from "./signal-detector.js";

export type RiskLevel =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export interface RiskReason {
  source: string;
  description: string;
  score: number;
}

export interface RiskAssessment {
  classification: ClassificationResult;
  signals: string[];
  riskScore: number;
  riskLevel: RiskLevel;
  decision: RiskDecision;
  reasons: RiskReason[];
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) {
    return "CRITICAL";
  }

  if (score >= 60) {
    return "HIGH";
  }

  if (score >= 30) {
    return "MEDIUM";
  }

  return "LOW";
}

export function assessRisk(
  change: string,
): RiskAssessment {
  const classification = classifyChange(change);

  const signals = detectRiskSignals(change);

  const reasons: RiskReason[] = [];

  for (const profile of classification.profiles) {
    reasons.push({
      source: "feature-profile",
      description: `${profile.featureType} feature`,
      score: profile.baseRiskScore,
    });
  }

  for (const signal of signals) {
    reasons.push({
      source: "risk-signal",
      description: signal.name,
      score: signal.score,
    });
  }

  const signalScore = signals.reduce(
    (total, signal) => total + signal.score,
    0,
  );

  const riskScore = Math.min(
    100,
    classification.riskScore + signalScore,
  );

const riskLevel = getRiskLevel(riskScore);

const decision = getRiskDecision(riskLevel);

 return {
  classification,
  signals: signals.map(
    (signal) => signal.name,
  ),
  riskScore,
  riskLevel,
  decision,
  reasons,
};
}