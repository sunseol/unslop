import type {
  AuditScores,
  Finding,
  ScoreAxis,
  Severity
} from "./types.js";

export const SCORE_AXES: ScoreAxis[] = [
  "visual_intent",
  "product_specificity",
  "hierarchy",
  "system_fit",
  "accessibility",
  "interaction_readiness",
  "brand_distinctiveness",
  "implementation_readiness",
  "copy_signal"
];

const PENALTY: Record<Severity, number> = {
  blocking: 35,
  high: 18,
  medium: 10,
  low: 5
};

const SCORE_WEIGHTS: Partial<Record<ScoreAxis, number>> = {
  accessibility: 25,
  system_fit: 20,
  copy_signal: 20,
  product_specificity: 15,
  hierarchy: 10,
  interaction_readiness: 5,
  visual_intent: 5
};

export function scoreFindings(findings: Finding[]): AuditScores {
  const axes = SCORE_AXES.map((axis) => {
    const penalty = findings
      .filter((finding) => finding.axis === axis)
      .reduce((sum, finding) => sum + PENALTY[finding.severity], 0);
    return {
      axis,
      score: Math.max(0, 100 - penalty)
    };
  });

  const designSignal = Math.round(
    axes.reduce(
      (sum, axisScore) => sum + axisScore.score * ((SCORE_WEIGHTS[axisScore.axis] ?? 0) / 100),
      0
    )
  );

  return {
    designSignal,
    aiSlopRisk: riskForScore(designSignal),
    productReadiness: findings.some((finding) => finding.severity === "blocking")
      ? "Blocked"
      : readinessForScore(designSignal),
    axes
  };
}

function riskForScore(score: number): AuditScores["aiSlopRisk"] {
  if (score < 45) {
    return "Very High";
  }
  if (score < 65) {
    return "High";
  }
  if (score < 80) {
    return "Medium";
  }
  return "Low";
}

function readinessForScore(score: number): AuditScores["productReadiness"] {
  if (score < 55) {
    return "Low";
  }
  if (score < 75) {
    return "Needs work";
  }
  if (score < 90) {
    return "Good";
  }
  return "Ready";
}
