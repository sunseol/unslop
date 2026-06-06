# unslop

Remove AI slop from UI, copy, and visual design.

`unslop` is a CLI-first design quality gate for AI-generated interfaces. It checks code, HTML, and live URLs for generic visual patterns, weak hierarchy, design-system drift, accessibility issues, missing UX states, and low product specificity.

Status: pre-alpha scaffold. The current scaffold runs deterministic checks for web UI source, stdin, browser-rendered URLs when Playwright is available, fetch-based URL fallback, and basic reports. v0.1 keeps Figma, user screenshot upload, external vision APIs, and automatic writes out of scope.

## Install

```bash
npm install
npm run build
npm link -w @unslop/cli
```

## Try It

```bash
unslop design init
unslop design check src/app/page.tsx
unslop design check --url http://localhost:3000 --json --agent
unslop design plan src/app/page.tsx --product "TOPIK learning app"
unslop design fix src/app/page.tsx --safe
unslop design report --url http://localhost:3000 -o unslop-report.html
```

CI mode exits non-zero when a blocking finding exists, the Design Signal Score is below threshold, Accessibility is below threshold, or `--fail-on-high` sees a high finding:

```bash
unslop design check --url http://localhost:3000 --threshold 75 --accessibility-threshold 85 --ci
```

JSON output follows schema version `0.1.0` and includes `decision`, `scores`, `findings`, `safe_fixes`, `suggested_fixes`, `human_review_required`, and `next_action`.

False positives can be suppressed with `ignore` entries in `unslop.design.yml` or with `unslop-ignore-next-line <rule-id>` comments.

Agent mode can consume `check --json --agent` or read stdin through `agent-check`:

```bash
cat design-output.html | unslop design agent-check --stdin --json
```

Agent-mode commands exit non-zero when the decision is not `pass`.

## MVP Rules

- Generic AI SaaS visual language: purple/cyan gradients, glow, glass cards, decorative orbs
- Card soup and weak hierarchy signals
- Generic UI copy: "Get Started", "Unlock your potential", "AI-powered insights"
- Design-system drift: arbitrary Tailwind values, ad-hoc hex colors, radius and shadow drift
- Accessibility basics: missing image alt text, icon-only buttons, unlabeled inputs, heading jumps
- Interaction readiness: missing loading, empty, error, disabled, or success states

## URL Checks

`unslop design check --url ...` uses Playwright browser rendering when Playwright is available in the local environment. If Playwright is not installed or cannot launch a browser, the CLI falls back to local `fetch` so deterministic HTML checks still run without adding a required browser dependency. When Playwright can launch but the page fails to render, the CLI reports that failure instead of silently downgrading to `fetch`.

## Before / After

Before:

```html
<main class="bg-gradient-to-br from-purple-600 to-cyan-400">
  <div class="absolute rounded-full blur-3xl"></div>
  <h1>Unlock your potential with AI-powered insights</h1>
  <button>Get Started</button>
</main>
```

After:

```html
<main class="bg-surface text-foreground">
  <h1>Review the TOPIK questions you missed this week</h1>
  <button>Review 5 wrong answers</button>
</main>
```

## Philosophy

AI detection is unreliable. Design quality is inspectable.

`unslop` does not try to prove whether a screen was AI-generated. It checks whether the screen reflects product intent, brand constraints, accessibility, design-system discipline, and real user workflows.

## Roadmap

See [docs/roadmap.md](docs/roadmap.md).

## Contributing

Repository workflow:

- [docs/repository-governance.md](docs/repository-governance.md)
- [docs/working-tree-rules.md](docs/working-tree-rules.md)
- [docs/pr-rules.md](docs/pr-rules.md)
- [docs/branch-protection.md](docs/branch-protection.md)

Planning source:

- [docs/planner-discovery-questions.md](docs/planner-discovery-questions.md)
- [docs/planner-discovery-answers-v0.1.md](docs/planner-discovery-answers-v0.1.md)
