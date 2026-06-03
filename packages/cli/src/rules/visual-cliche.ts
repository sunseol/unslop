import type { AuditConfig, AuditInput, Finding, Rule } from "../core/types.js";
import { countMatches, createFinding, locate } from "./helpers.js";

export const visualClicheRule: Rule = {
  id: "visual-cliche",
  run(input: AuditInput, config: AuditConfig): Finding[] {
    const content = input.content;
    const lower = content.toLowerCase();
    const findings: Finding[] = [];
    const hasGradient = /bg-gradient|linear-gradient|radial-gradient|from-/.test(lower);
    const hasPurpleCyan =
      /(purple|violet|fuchsia|indigo)/.test(lower) && /(cyan|sky|teal|blue)/.test(lower);
    const hasGlow = /blur-3xl|blur-\[|shadow-\[|drop-shadow|glow|mix-blend|opacity-/.test(lower);
    const cardCount = countMatches(lower, /rounded(?:-\w+|\[[^\]]+\])?.{0,80}(shadow|border|ring)/g);

    if (hasGradient && hasPurpleCyan && hasGlow) {
      findings.push(
        createFinding({
          id: "generic-ai-saas-hero",
          title: "Generic AI SaaS visual pattern",
          severity: "high",
          axis: "visual_intent",
          message:
            "The UI combines gradient, purple/cyan palette, and glow effects, a high-frequency AI-generated SaaS pattern.",
          suggestion:
            "Remove decorative glow and map the hero surface to brand or product-specific visual rationale.",
          fixKind: "human_review",
          located: locate(input, /bg-gradient|linear-gradient|radial-gradient|from-/i),
          evidence: "gradient + purple/cyan + glow"
        })
      );
    }

    if (/rounded-full/.test(lower) && /(blur-2xl|blur-3xl|absolute|orb|blob)/.test(lower)) {
      findings.push(
        createFinding({
          id: "decorative-orb",
          title: "Decorative orb or blob",
          severity: "medium",
          axis: "visual_intent",
          message: "The screen appears to include decorative blobs or orbs without product meaning.",
          suggestion:
            "Remove the decoration or replace it with a product-relevant visual such as a real workflow state.",
          fixKind: "suggested",
          located: locate(input, /rounded-full/i)
        })
      );
    }

    if (/backdrop-blur|bg-white\/10|bg-white\/\[/.test(lower)) {
      findings.push(
        createFinding({
          id: "glass-card",
          title: "Glassmorphism without clear layering need",
          severity: "medium",
          axis: "system_fit",
          message: "Glass cards often add polish without improving information structure.",
          suggestion:
            "Use standard surface, border, and elevation tokens unless translucent layering is required.",
          fixKind: "suggested",
          located: locate(input, /backdrop-blur|bg-white\/10|bg-white\/\[/i)
        })
      );
    }

    if (cardCount >= 6) {
      findings.push(
        createFinding({
          id: "card-soup",
          title: "Card soup",
          severity: "high",
          axis: "hierarchy",
          message: `Detected ${cardCount} card-like rounded border/shadow patterns, which can flatten hierarchy.`,
          suggestion:
            "Reduce competing cards and reserve framed cards for repeated items or genuinely grouped tools.",
          fixKind: "suggested",
          located: locate(input, /rounded(?:-\w+|\[[^\]]+\])?/i),
          evidence: `${cardCount} card-like patterns`
        })
      );
    }

    for (const phrase of config.brand?.avoid_visuals ?? []) {
      const located = locate(input, phrase);
      if (!located) {
        continue;
      }
      findings.push(
        createFinding({
          id: `brand-avoid-visual-${phrase.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          title: "Brand avoid-visual pattern",
          severity: "medium",
          axis: "brand_distinctiveness",
          message: "The UI uses a visual pattern listed in brand.avoid_visuals.",
          suggestion: "Replace this visual language with a brand-approved surface or product state.",
          fixKind: "human_review",
          located
        })
      );
    }

    return findings;
  }
};
