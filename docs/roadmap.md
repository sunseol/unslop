# Roadmap

## v0.1: Web UI Slop Checker

- `unslop design check <file-or-dir>`
- `unslop design check --url <url>`
- text and JSON reports
- deterministic rules for visual cliche, generic copy, accessibility basics, design-system drift, and missing states

## v0.2: Fix Plan and HTML Report

- `unslop design plan`
- `unslop design report`
- safe fix, suggested fix, and human-review buckets
- report artifacts suitable for PR comments and handoff

## v0.3: React and Tailwind Guard

- deeper TSX/JSX scanning
- duplicate UI pattern detection
- semantic HTML checks
- Tailwind arbitrary-value and token alignment checks

## v0.4: Figma Adapter

- Figma file analysis
- variables and component-instance checks
- auto-layout and layer naming checks
- design-token drift report

## v0.5: Agent Gate

- strict JSON schema
- pass/fail/revise decisions
- safe patch suggestions
- human-review flags for agent workflows
