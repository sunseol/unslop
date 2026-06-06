import type {
  AuditConfig,
  AuditInput,
  AuditResult,
  Finding,
  IgnoreConfig,
  Rule
} from "./types.js";
import { scoreFindings } from "./scoring.js";

export function runAudit(
  input: AuditInput,
  config: AuditConfig,
  rules: Rule[]
): AuditResult {
  const findings = applySuppressions(
    input,
    config,
    dedupeFindings(rules.flatMap((rule) => rule.run(input, config)))
  );

  return {
    input,
    config,
    findings,
    scores: scoreFindings(findings)
  };
}

function applySuppressions(
  input: AuditInput,
  config: AuditConfig,
  findings: Finding[]
): Finding[] {
  const inlineSuppressions = collectInlineSuppressions(input);
  return findings.filter(
    (finding) =>
      !isConfigIgnored(input, finding, config.ignore ?? []) &&
      !isInlineIgnored(finding, inlineSuppressions)
  );
}

interface InlineSuppression {
  path: string;
  line: number;
  ruleId: string;
}

function collectInlineSuppressions(input: AuditInput): InlineSuppression[] {
  const suppressions: InlineSuppression[] = [];

  for (const file of input.files) {
    const lines = file.content.split(/\r?\n/);
    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index] ?? "";
      const nextLineMatch = line.match(/\bunslop-ignore-next-line\s+([a-zA-Z0-9_.:-]+)/);
      if (!nextLineMatch?.[1]) {
        continue;
      }
      suppressions.push({
        path: file.path,
        line: index + 2,
        ruleId: nextLineMatch[1]
      });
    }
  }

  return suppressions;
}

function isConfigIgnored(
  input: AuditInput,
  finding: Finding,
  ignores: IgnoreConfig[]
): boolean {
  return ignores.some((ignore) => {
    if (!ruleMatches(finding, ignore.rule_id)) {
      return false;
    }
    const target = ignore.target;
    if (!target) {
      return true;
    }

    return Boolean(
      finding.source?.path && sourcePathMatchesTarget(finding.source.path, target)
    );
  });
}

function isInlineIgnored(
  finding: Finding,
  suppressions: InlineSuppression[]
): boolean {
  if (!finding.source) {
    return false;
  }

  return suppressions.some(
    (suppression) =>
      suppression.path === finding.source?.path &&
      suppression.line === finding.source.line &&
      ruleMatches(finding, suppression.ruleId)
  );
}

function ruleMatches(finding: Finding, ruleId: string): boolean {
  return ruleId === finding.id;
}

function sourcePathMatchesTarget(sourcePath: string, target: string): boolean {
  const normalizedSource = normalizePath(sourcePath);
  const normalizedTarget = normalizePath(target);
  return (
    normalizedSource === normalizedTarget ||
    normalizedSource.endsWith(`/${normalizedTarget}`)
  );
}

function normalizePath(path: string): string {
  return path.replaceAll("\\", "/");
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
  if (severity === "blocking") {
    return 4;
  }
  if (severity === "high") {
    return 3;
  }
  if (severity === "medium") {
    return 2;
  }
  return 1;
}
