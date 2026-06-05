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

`agent-check` remains a future formal command. In v0.1, agent workflows should consume `check --json --agent` or the stable JSON output from `check --json`.

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

Visual Intent and Interaction Readiness may remain internal finding categories in v0.1. Blocking findings can force the decision to `block` regardless of aggregate score.

Default thresholds:

- `design_signal`: 75
- `accessibility`: 85

CI mode fails when:

- at least one `blocking` finding exists
- `Design Signal Score < threshold`
- `Accessibility Score < accessibility threshold`
- `--fail-on-high` is set and at least one `high` finding exists

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
