import type { AuditResult, Finding, ScoreAxis } from "./types.js";

export const SCHEMA_VERSION = "0.1.0";

export const DEFAULT_THRESHOLDS = {
  design_signal: 75,
  accessibility: 85
};

export type Decision = "pass" | "revise" | "block";

export interface QualityGateOptions {
  designSignalThreshold?: number | undefined;
  accessibilityThreshold?: number | undefined;
  failOnHigh?: boolean | undefined;
}

export interface QualityGate {
  decision: Decision;
  thresholds: {
    design_signal: number;
    accessibility: number;
  };
  failures: string[];
  blockingCount: number;
  highCount: number;
}

export function evaluateQualityGate(
  result: AuditResult,
  options: QualityGateOptions = {}
): QualityGate {
  const thresholds = {
    design_signal:
      options.designSignalThreshold ??
      result.config.thresholds?.design_signal ??
      DEFAULT_THRESHOLDS.design_signal,
    accessibility:
      options.accessibilityThreshold ??
      result.config.thresholds?.accessibility ??
      DEFAULT_THRESHOLDS.accessibility
  };
  const blockingCount = countSeverity(result.findings, "blocking");
  const highCount = countSeverity(result.findings, "high");
  const accessibilityScore = scoreForAxis(result, "accessibility");
  const failures: string[] = [];

  if (blockingCount > 0) {
    failures.push("blocking_finding");
  }
  if (result.scores.designSignal < thresholds.design_signal) {
    failures.push("design_signal_below_threshold");
  }
  if (accessibilityScore < thresholds.accessibility) {
    failures.push("accessibility_below_threshold");
  }
  if (options.failOnHigh && highCount > 0) {
    failures.push("high_finding");
  }

  let decision: Decision = "pass";
  if (blockingCount > 0) {
    decision = "block";
  } else if (
    result.scores.designSignal < thresholds.design_signal ||
    accessibilityScore < thresholds.accessibility ||
    highCount > 0
  ) {
    decision = "revise";
  }

  return {
    decision,
    thresholds,
    failures,
    blockingCount,
    highCount
  };
}

export function scoreForAxis(result: AuditResult, axis: ScoreAxis): number {
  return result.scores.axes.find((axisScore) => axisScore.axis === axis)?.score ?? 100;
}

function countSeverity(findings: Finding[], severity: Finding["severity"]): number {
  return findings.filter((finding) => finding.severity === severity).length;
}
