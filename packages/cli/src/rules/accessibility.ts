import type { AuditInput, Finding, Rule } from "../core/types.js";
import { createFinding, locate } from "./helpers.js";

export const accessibilityRule: Rule = {
  id: "accessibility",
  run(input: AuditInput): Finding[] {
    const findings: Finding[] = [];

    if (/<img\b(?![^>]*\balt=)[^>]*>/i.test(input.content)) {
      findings.push(
        createFinding({
          id: "image-missing-alt",
          title: "Image missing alt text",
          severity: "medium",
          axis: "accessibility",
          message: "Images need alt text or an explicit decorative treatment.",
          suggestion: "Add meaningful alt text, or mark decorative images with alt=\"\".",
          fixKind: "safe",
          located: locate(input, /<img\b(?![^>]*\balt=)[^>]*>/i)
        })
      );
    }

    if (/<button\b(?![^>]*aria-label)(?=[\s\S]*?<svg)[\s\S]{0,240}?<\/button>/i.test(input.content)) {
      findings.push(
        createFinding({
          id: "icon-button-missing-label",
          title: "Icon-only button without accessible label",
          severity: "high",
          axis: "accessibility",
          message: "Icon-only buttons need an accessible name.",
          suggestion: "Add aria-label or visible text that names the button action.",
          fixKind: "safe",
          located: locate(input, /<button\b(?![^>]*aria-label)(?=[\s\S]*?<svg)[\s\S]{0,240}?<\/button>/i)
        })
      );
    }

    if (/<input\b(?![^>]*(aria-label|aria-labelledby|id=))[^>]*>/i.test(input.content)) {
      findings.push(
        createFinding({
          id: "input-missing-label-hook",
          title: "Input missing label hook",
          severity: "medium",
          axis: "accessibility",
          message: "Inputs need a label relationship or an accessible label.",
          suggestion: "Add a visible label with htmlFor/id or an aria-label where appropriate.",
          fixKind: "safe",
          located: locate(input, /<input\b(?![^>]*(aria-label|aria-labelledby|id=))[^>]*>/i)
        })
      );
    }

    const headingJump = findHeadingJump(input.content);
    if (headingJump) {
      findings.push(
        createFinding({
          id: "heading-order-jump",
          title: "Heading order jumps",
          severity: "medium",
          axis: "accessibility",
          message: `Heading order jumps from h${headingJump.from} to h${headingJump.to}.`,
          suggestion: "Use headings in document order so assistive technology can navigate the page.",
          fixKind: "safe",
          located: locate(input, new RegExp(`<h${headingJump.to}\\b`, "i"))
        })
      );
    }

    return findings;
  }
};

function findHeadingJump(content: string): { from: number; to: number } | undefined {
  const levels = Array.from(content.matchAll(/<h([1-6])\b/gi), (match) => Number(match[1]));
  for (let index = 1; index < levels.length; index += 1) {
    const previous = levels[index - 1];
    const current = levels[index];
    if (previous && current && current > previous + 1) {
      return { from: previous, to: current };
    }
  }
  return undefined;
}
