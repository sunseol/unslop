import type { AuditConfig, AuditInput, Finding, Rule } from "../core/types.js";
import { createFinding, locate, uniqueMatches } from "./helpers.js";

export const designSystemRule: Rule = {
  id: "design-system",
  run(input: AuditInput, config: AuditConfig): Finding[] {
    const findings: Finding[] = [];
    const arbitraryValues = uniqueMatches(input.content, /\[[^\]\n]{2,80}\]/g).filter(
      (value) => !value.startsWith("[&")
    );
    const hexColors = uniqueMatches(input.content, /#[0-9a-fA-F]{3,8}\b/g);
    const offScaleSpacing = findOffScaleSpacing(input.content, config.tokens?.spacing);
    const arbitraryRadius = uniqueMatches(input.content, /rounded-\[[^\]]+\]/g);
    const arbitraryShadow = uniqueMatches(input.content, /shadow-\[[^\]]+\]|drop-shadow-\[[^\]]+\]/g);

    if (arbitraryValues.length > 0) {
      findings.push(
        createFinding({
          id: "tailwind-arbitrary-values",
          title: "Arbitrary Tailwind values",
          severity: arbitraryValues.length > 8 ? "high" : "medium",
          axis: "system_fit",
          message: "Arbitrary values make spacing, sizing, color, and layout drift away from tokens.",
          suggestion: "Map arbitrary values to design tokens or documented component variants.",
          fixKind: "safe",
          located: locate(input, /\[[^\]\n]{2,80}\]/),
          evidence: arbitraryValues.slice(0, 8).join(", ")
        })
      );
    }

    if (hexColors.length > 0) {
      findings.push(
        createFinding({
          id: "ad-hoc-hex-colors",
          title: "Ad-hoc hex colors",
          severity: hexColors.length > 6 ? "high" : "medium",
          axis: "system_fit",
          message: "Raw hex colors usually indicate design-token drift.",
          suggestion: "Replace raw colors with semantic tokens such as surface, text, primary, or danger.",
          fixKind: "safe",
          located: locate(input, /#[0-9a-fA-F]{3,8}\b/),
          evidence: hexColors.slice(0, 10).join(", ")
        })
      );
    }

    if (offScaleSpacing.length > 0) {
      findings.push(
        createFinding({
          id: "spacing-off-scale",
          title: "Spacing off token scale",
          severity: "medium",
          axis: "system_fit",
          message: "Detected pixel spacing values outside the configured spacing scale.",
          suggestion: "Snap spacing to the nearest configured token.",
          fixKind: "safe",
          located: locate(input, /(p|m|gap|space|top|left|right|bottom|inset)-\[(\d+)px\]/),
          evidence: offScaleSpacing.slice(0, 10).join(", ")
        })
      );
    }

    if (arbitraryRadius.length > 0) {
      findings.push(
        createFinding({
          id: "arbitrary-radius",
          title: "Arbitrary radius",
          severity: "medium",
          axis: "system_fit",
          message: "Arbitrary radius values make components feel detached from the design system.",
          suggestion: "Use the configured radius scale or component variants.",
          fixKind: "safe",
          located: locate(input, /rounded-\[[^\]]+\]/),
          evidence: arbitraryRadius.slice(0, 8).join(", ")
        })
      );
    }

    if (arbitraryShadow.length > 0) {
      findings.push(
        createFinding({
          id: "arbitrary-shadow",
          title: "Arbitrary glow or shadow",
          severity: "medium",
          axis: "visual_intent",
          message: "Custom shadows and glows often add generic polish without semantic elevation.",
          suggestion: "Use shadow tokens only where elevation or focus needs to be communicated.",
          fixKind: "safe",
          located: locate(input, /shadow-\[[^\]]+\]|drop-shadow-\[[^\]]+\]/),
          evidence: arbitraryShadow.slice(0, 6).join(", ")
        })
      );
    }

    return findings;
  }
};

function findOffScaleSpacing(content: string, spacing: number[] = [0, 4, 8, 12, 16, 24, 32, 48, 64]): string[] {
  const values = Array.from(
    content.matchAll(/(?:p|m|gap|space|top|left|right|bottom|inset)-\[(\d+)px\]/g),
    (match) => Number(match[1])
  ).filter((value) => !spacing.includes(value));

  return Array.from(new Set(values)).map((value) => `${value}px`);
}
