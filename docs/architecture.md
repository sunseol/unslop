# Architecture

`unslop` starts as a CLI-first design quality gate. The v0.1 product decision is to analyze browser-rendered localhost URLs and React/Tailwind/static files without sending data to external APIs by default.

Source of truth: [planner-discovery-answers-v0.1.md](planner-discovery-answers-v0.1.md).

## Package Direction

```text
@unslop/core
  rule-engine
  scoring
  finding schema
  config
  rule fixtures

@unslop/cli
  command parsing
  terminal output
  JSON output
  CI exit behavior
  config initialization

@unslop/browser
  Playwright-based URL adapter
  rendered DOM extraction
  computed style extraction
  contrast and viewport checks

future packages
  @unslop/figma
  @unslop/github-action
```

The current scaffold keeps most code in `@unslop/cli`, but v0.1 development should move shared rule and scoring logic toward `@unslop/core` and keep Playwright behind a browser adapter boundary.

Current implementation note: the CLI package owns the first browser adapter boundary in `src/adapters/browser.ts`. It uses Playwright when that package is available in the local environment and falls back to local `fetch` only when Playwright is unavailable or cannot launch, avoiding any external API calls or required browser dependency in the pre-alpha scaffold. Page render failures are surfaced instead of silently downgrading to `fetch`.

## v0.1 Inputs

- `--url http://localhost:3000`
- `http://127.0.0.1:5173`
- React/Tailwind files such as `src/**/*.tsx`
- HTML/CSS/MDX files
- optional `unslop.design.yml`

Public URLs may work, but the product message is localhost-first. HTML fetch alone is not enough for v0.1 URL checks because AI-generated UI often depends on client-side rendering, computed style, viewport behavior, and accessibility structure.

## v0.1 Commands

```bash
unslop design init
unslop design check --url http://localhost:3000
unslop design check "src/**/*.tsx"
unslop design check --url http://localhost:3000 --json
unslop design check --url http://localhost:3000 --ci
```

In v0.1, agent workflows should consume `check --json --agent` or the stable JSON output from `check --json`. The scaffold keeps `agent-check` as a compatibility command that emits the same schema in `agent` mode.

Current JSON output uses `schema_version: "0.1.0"` and emits `decision`, `scores`, normalized findings, safe/suggested/human-review fix buckets, and `next_action`.
Agent-mode commands exit non-zero when the decision is not `pass`.

## Finding Schema

Each finding should include enough evidence to be useful to humans and agents:

```json
{
  "id": "generic-cta-001",
  "rule_id": "copy.generic_cta",
  "category": "copy_signal",
  "severity": "medium",
  "confidence": 0.82,
  "target": {
    "type": "dom",
    "selector": "main section.hero a.primary"
  },
  "message": "Primary CTA is generic.",
  "evidence": "Get Started",
  "reason": "The CTA does not explain what happens next.",
  "suggested_fix": "Replace with a task-specific CTA.",
  "fix_bucket": "suggested"
}
```

Severity levels:

- `low`
- `medium`
- `high`
- `blocking`

Fix buckets:

- `safe`
- `suggested`
- `human_review`

## Scoring Strategy

The official score is `Design Signal Score`, reported on a 100-point scale.

v0.1 should expose these score axes:

- Accessibility: 25%
- System Fit: 20%
- Copy Signal: 20%
- Product Specificity: 15%
- Hierarchy: 10%
- Interaction Readiness: 5%
- Visual Intent: 5%

Brand Distinctiveness and Implementation Readiness remain exposed as finding axes but do not affect the weighted Design Signal Score in the scaffold. Blocking findings can force the decision to `block` regardless of aggregate score.

Default thresholds:

- `design_signal`: 75
- `accessibility`: 85

CI mode fails when:

- at least one `blocking` finding exists
- `Design Signal Score < threshold`
- `Accessibility Score < accessibility threshold`
- `--fail-on-high` is set and at least one `high` finding exists

The scaffold also treats unsupported image input as a blocking implementation-readiness finding because v0.1 does not analyze user-provided screenshots.

## Rule Families

v0.1 rule families:

- Accessibility
- Generic UI copy
- Design system drift
- Visual cliché combination
- Product specificity
- Layout hierarchy
- Missing interaction states
- React/Tailwind implementation slop

Each rule needs pass and fail fixtures.

## Privacy

v0.1 is local-only by default:

- no telemetry
- no external vision API
- no external LLM API
- no user-uploaded screenshot analysis

Future screenshot and vision adapters must make external data transfer explicit.
