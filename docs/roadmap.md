# Roadmap

Source of truth: [planner-discovery-answers-v0.1.md](planner-discovery-answers-v0.1.md).

## v0.1: Browser-Rendered Web UI Gate

`unslop` v0.1 is a CLI for checking AI-generated web UI before release. It focuses on localhost web apps and React/Tailwind/static source files.

Required commands:

```bash
unslop design init
unslop design check --url http://localhost:3000
unslop design check "src/**/*.tsx"
unslop design check --url http://localhost:3000 --json
unslop design check --url http://localhost:3000 --ci
```

Scope:

- browser-rendered URL checks through Playwright
- React/Tailwind/HTML/CSS/MDX file checks
- optional `unslop.design.yml`
- Design Signal Score
- stable JSON output
- CI mode with threshold-based failure
- core rule fixtures
- no external API by default
- no telemetry

v0.1 explicitly excludes:

- Figma adapter
- Figma plugin
- VS Code extension
- external vision API
- user-uploaded screenshot analysis
- automatic design fixes
- brand profile generation
- SaaS dashboard
- full GitHub Action integration
- complex AI rewrite flows

## v0.2: Fix Plan and HTML Report

- `unslop design plan`
- `unslop design report`
- screenshot capture in reports
- safe, suggested, and human-review buckets
- report artifacts suitable for design review, PR comments, and handoff

## v0.3: React and Tailwind Guard

- deeper React/Tailwind AST analysis
- arbitrary value detection
- component duplication detection
- semantic HTML checks
- token drift detection
- state detection
- GitHub Action

## v0.4: Figma Adapter

- `unslop design check --figma FILE_KEY`
- Figma file analysis
- variables and component-instance checks
- auto-layout and layer naming checks
- design-token drift report

## v0.5: Agent Mode

- `unslop design agent-check --json`
- strict JSON schema
- pass/fail/revise decisions
- safe patch suggestions
- human-review flags for agent workflows

## v1+: Product Extensions

- VS Code extension
- Figma plugin
- team rule dashboard
- private design quality reports
- GitHub organization analytics
- brand profile management
