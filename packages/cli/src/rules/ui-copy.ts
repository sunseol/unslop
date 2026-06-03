import type { AuditConfig, AuditInput, Finding, Rule } from "../core/types.js";
import { createFinding, locate } from "./helpers.js";

const BUILT_IN_PATTERNS = [
  {
    id: "generic-cta-get-started",
    phrase: "Get Started",
    title: "Generic CTA copy",
    message: "The CTA does not describe what happens next or tie to a user task.",
    suggestion: "Replace the CTA with a concrete next action, such as \"Review 5 wrong answers\".",
    severity: "medium" as const
  },
  {
    id: "generic-cta-learn-more",
    phrase: "Learn More",
    title: "Generic secondary CTA",
    message: "The secondary CTA hides the actual destination or outcome.",
    suggestion: "Name the destination or action directly.",
    severity: "low" as const
  },
  {
    id: "buzzword-unlock-potential",
    phrase: "Unlock your potential",
    title: "Buzzword headline",
    message: "The headline is polished but does not reveal a product-specific user outcome.",
    suggestion: "Rewrite the headline around a specific task, object, or user state.",
    severity: "high" as const
  },
  {
    id: "buzzword-ai-insights",
    phrase: "AI-powered insights",
    title: "Generic AI value claim",
    message: "The copy claims AI value without naming the workflow it improves.",
    suggestion: "Describe the concrete workflow and result the user gets.",
    severity: "medium" as const
  },
  {
    id: "buzzword-seamless",
    phrase: "seamless",
    title: "Empty product adjective",
    message: "The copy relies on a broad adjective instead of evidence or a user outcome.",
    suggestion: "Replace the adjective with a measurable or observable benefit.",
    severity: "low" as const
  },
  {
    id: "ko-generic-ux",
    phrase: "사용자 경험을 향상",
    title: "Generic Korean UX claim",
    message: "The copy uses a broad UX improvement claim without product context.",
    suggestion: "Name the exact user task or friction being improved.",
    severity: "medium" as const
  },
  {
    id: "ko-innovative",
    phrase: "혁신적인",
    title: "Generic innovation claim",
    message: "The copy leans on a broad innovation claim instead of concrete product evidence.",
    suggestion: "Replace it with the specific capability or outcome.",
    severity: "low" as const
  }
];

export const uiCopyRule: Rule = {
  id: "ui-copy",
  run(input: AuditInput, config: AuditConfig): Finding[] {
    const findings: Finding[] = [];
    const configured = config.brand?.avoid_copy ?? [];

    for (const pattern of BUILT_IN_PATTERNS) {
      const located = locate(input, pattern.phrase);
      if (!located) {
        continue;
      }
      findings.push(
        createFinding({
          id: pattern.id,
          title: pattern.title,
          severity: pattern.severity,
          axis: "copy_signal",
          message: pattern.message,
          suggestion: pattern.suggestion,
          fixKind: pattern.severity === "high" ? "suggested" : "safe",
          located
        })
      );
    }

    for (const phrase of configured) {
      const located = locate(input, phrase);
      if (!located) {
        continue;
      }
      findings.push(
        createFinding({
          id: `brand-avoid-copy-${slug(phrase)}`,
          title: "Brand avoid-copy phrase",
          severity: "medium",
          axis: "brand_distinctiveness",
          message: "The UI copy uses a phrase listed in brand.avoid_copy.",
          suggestion: "Rewrite this phrase in the product's preferred tone and vocabulary.",
          fixKind: "safe",
          located
        })
      );
    }

    return findings;
  }
};

function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}
