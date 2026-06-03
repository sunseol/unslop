import type { AuditInput, Finding, Rule } from "../core/types.js";
import { countMatches, createFinding, locate } from "./helpers.js";

export const implementationRule: Rule = {
  id: "implementation",
  run(input: AuditInput): Finding[] {
    const findings: Finding[] = [];
    const lower = input.content.toLowerCase();

    if (input.kind === "image") {
      findings.push(
        createFinding({
          id: "screenshot-adapter-pending",
          title: "Screenshot adapter pending",
          severity: "high",
          axis: "implementation_readiness",
          message: "This scaffold accepts image targets, but screenshot vision analysis is not implemented yet.",
          suggestion: "Use code or --url for v0.1, or add a screenshot adapter that emits normalized AuditInput.",
          fixKind: "suggested",
          evidence: input.target
        })
      );
      return findings;
    }

    if (!/(loading|pending|skeleton|empty|error|disabled|success|fail|retry)/i.test(input.content)) {
      findings.push(
        createFinding({
          id: "missing-ui-states",
          title: "Missing UI states",
          severity: "medium",
          axis: "interaction_readiness",
          message: "No loading, empty, error, disabled, retry, or success states were detected.",
          suggestion:
            "Add concrete states for the main workflow before treating the screen as product-ready.",
          fixKind: "suggested"
        })
      );
    }

    const divCount = countMatches(lower, /<div\b/g);
    const semanticCount = countMatches(lower, /<(main|section|article|nav|header|footer|aside)\b/g);
    if (divCount >= 12 && semanticCount < 3) {
      findings.push(
        createFinding({
          id: "div-soup",
          title: "Low semantic structure",
          severity: "medium",
          axis: "implementation_readiness",
          message: `Detected ${divCount} divs but only ${semanticCount} semantic layout elements.`,
          suggestion: "Use semantic containers that match the page structure and user workflow.",
          fixKind: "safe",
          located: locate(input, /<div\b/i),
          evidence: `${divCount} divs, ${semanticCount} semantic elements`
        })
      );
    }

    if (/total revenue|user growth|engagement|performance|analytics/i.test(input.content)) {
      findings.push(
        createFinding({
          id: "fake-dashboard-labels",
          title: "Generic dashboard labels",
          severity: "medium",
          axis: "product_specificity",
          message: "Dashboard labels are generic and do not prove product-specific workflow knowledge.",
          suggestion: "Replace generic metrics with real objects and states from the product domain.",
          fixKind: "suggested",
          located: locate(input, /total revenue|user growth|engagement|performance|analytics/i)
        })
      );
    }

    return findings;
  }
};
