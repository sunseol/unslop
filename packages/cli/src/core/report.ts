import { writeFileSync } from "node:fs";
import type { AuditResult, Finding, FixKind, ScoreAxis } from "./types.js";
import { evaluateQualityGate, type QualityGate } from "./decision.js";

const AXIS_LABEL: Record<ScoreAxis, string> = {
  visual_intent: "Visual Intent",
  product_specificity: "Product Specificity",
  hierarchy: "Hierarchy",
  system_fit: "Design System Fit",
  accessibility: "Accessibility",
  interaction_readiness: "Interaction Readiness",
  brand_distinctiveness: "Brand Distinctiveness",
  implementation_readiness: "Implementation Readiness",
  copy_signal: "Copy Signal"
};

const FIX_LABEL: Record<FixKind, string> = {
  safe: "Safe fixes",
  suggested: "Suggested design changes",
  human_review: "Human review required"
};

export function formatTextReport(result: AuditResult, gate = evaluateQualityGate(result)): string {
  const lines = [
    "UNSLOP DESIGN REPORT",
    "",
    "Target:",
    `  ${result.input.target}`,
    "",
    "Design Signal Score:",
    `  ${result.scores.designSignal} / 100`,
    "",
    "Decision:",
    `  ${gate.decision}`,
    "",
    "AI Slop Risk:",
    `  ${result.scores.aiSlopRisk}`,
    "",
    "Product Readiness:",
    `  ${result.scores.productReadiness}`,
    "",
    "Scores:"
  ];

  for (const axis of result.scores.axes) {
    lines.push(`  ${AXIS_LABEL[axis.axis].padEnd(28)} ${axis.score}`);
  }

  if (result.findings.length === 0) {
    lines.push("", "No findings.");
    return lines.join("\n");
  }

  lines.push("", "Top Findings:");
  for (const finding of result.findings.slice(0, 5)) {
    lines.push(formatFinding(finding));
  }

  appendNextAction(lines, gate);

  return lines.join("\n");
}

export function formatPlan(result: AuditResult, product?: string): string {
  const productLine =
    product ?? result.config.product?.name ?? result.config.product?.type ?? "the product";
  const lines = [
    "# Design Fix Plan",
    "",
    `Target: ${result.input.target}`,
    `Product context: ${productLine}`,
    "",
    "## 1. Remove generic AI polish"
  ];

  appendFixGroup(lines, result, "safe");
  lines.push("", "## 2. Restore hierarchy and product intent");
  appendFixGroup(lines, result, "suggested");
  lines.push("", "## 3. Hold brand-level decisions for review");
  appendFixGroup(lines, result, "human_review");

  if (result.findings.length === 0) {
    lines.push("- No issues detected by the current deterministic rules.");
  }

  return lines.join("\n");
}

export function writeHtmlReport(result: AuditResult, output: string): void {
  writeFileSync(output, formatHtmlReport(result), "utf8");
}

export function formatHtmlReport(result: AuditResult): string {
  const findings = result.findings
    .map(
      (finding) => `
        <li class="finding ${finding.severity}">
          <div class="finding-title">${escapeHtml(finding.title)}</div>
          <div class="finding-meta">${escapeHtml(finding.severity)} · ${escapeHtml(
            AXIS_LABEL[finding.axis]
          )}</div>
          <p>${escapeHtml(finding.message)}</p>
          <p><strong>Suggestion:</strong> ${escapeHtml(finding.suggestion)}</p>
          ${finding.evidence ? `<code>${escapeHtml(finding.evidence)}</code>` : ""}
        </li>`
    )
    .join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Unslop Design Report</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
    body { margin: 0; background: #f8fafc; color: #111827; }
    main { max-width: 960px; margin: 0 auto; padding: 40px 24px; }
    h1 { margin: 0 0 8px; font-size: 32px; line-height: 1.1; }
    .summary { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 24px 0; }
    .metric, .finding { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; }
    .metric strong { display: block; font-size: 28px; }
    .axes { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 8px; }
    .axis { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
    .findings { list-style: none; padding: 0; display: grid; gap: 12px; }
    .finding-title { font-weight: 700; }
    .finding-meta { color: #4b5563; font-size: 14px; margin-top: 4px; text-transform: uppercase; }
    .high { border-left: 4px solid #dc2626; }
    .medium { border-left: 4px solid #d97706; }
    .low { border-left: 4px solid #2563eb; }
    code { display: block; white-space: pre-wrap; background: #f3f4f6; border-radius: 6px; padding: 8px; }
  </style>
</head>
<body>
  <main>
    <h1>Unslop Design Report</h1>
    <p>${escapeHtml(result.input.target)}</p>
    <section class="summary">
      <div class="metric"><span>Design Signal</span><strong>${result.scores.designSignal}/100</strong></div>
      <div class="metric"><span>AI Slop Risk</span><strong>${escapeHtml(result.scores.aiSlopRisk)}</strong></div>
      <div class="metric"><span>Readiness</span><strong>${escapeHtml(result.scores.productReadiness)}</strong></div>
    </section>
    <section class="axes">
      ${result.scores.axes
        .map(
          (axis) =>
            `<div class="axis">${escapeHtml(AXIS_LABEL[axis.axis])}: <strong>${axis.score}</strong></div>`
        )
        .join("\n")}
    </section>
    <h2>Findings</h2>
    <ul class="findings">${findings || "<li>No findings.</li>"}</ul>
  </main>
</body>
</html>`;
}

function formatFinding(finding: Finding): string {
  const location = finding.source
    ? ` (${finding.source.path}:${finding.source.line})`
    : "";
  const lines = [
    `- [${finding.severity.toUpperCase()}] ${finding.title}${location}`,
    `  ${finding.message}`,
    `  Suggested: ${finding.suggestion}`
  ];
  if (finding.evidence) {
    lines.push(`  Evidence: ${finding.evidence}`);
  }
  return lines.join("\n");
}

function appendFixGroup(lines: string[], result: AuditResult, fixKind: FixKind): void {
  const findings = result.findings.filter((finding) => finding.fixKind === fixKind);
  if (findings.length === 0) {
    lines.push(`- ${FIX_LABEL[fixKind]}: none from current findings.`);
    return;
  }
  for (const finding of findings) {
    lines.push(`- ${finding.suggestion}`);
  }
}

function appendNextAction(lines: string[], gate: QualityGate): void {
  lines.push("", "Next:");
  if (gate.decision === "pass") {
    lines.push("  Ready for review or CI use.");
    return;
  }
  if (gate.decision === "block") {
    lines.push("  Resolve blocking findings before continuing.");
    return;
  }
  lines.push("  Run unslop design check --json for the full machine-readable result.");
  lines.push("  Run unslop design plan for a grouped fix plan.");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}
