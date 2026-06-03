import type { AuditConfig, AuditInput, AuditResult, Finding, Rule } from "./types.js";
import { scoreFindings } from "./scoring.js";

export function runAudit(
  input: AuditInput,
  config: AuditConfig,
  rules: Rule[]
): AuditResult {
  const findings = dedupeFindings(
    rules.flatMap((rule) => rule.run(input, config))
  );

  return {
    input,
    config,
    findings,
    scores: scoreFindings(findings)
  };
}

function dedupeFindings(findings: Finding[]): Finding[] {
  const seen = new Set<string>();
  const deduped: Finding[] = [];

  for (const finding of findings) {
    const key = [
      finding.id,
      finding.source?.path ?? "",
      finding.source?.line ?? "",
      finding.evidence ?? ""
    ].join(":");
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    deduped.push(finding);
  }

  return deduped.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));
}

function severityRank(severity: Finding["severity"]): number {
  if (severity === "high") {
    return 3;
  }
  if (severity === "medium") {
    return 2;
  }
  return 1;
}
