# unslop

Remove AI slop from UI, copy, and visual design.

`unslop` is a CLI-first design quality gate for AI-generated interfaces. It checks code, HTML, and live URLs for generic visual patterns, weak hierarchy, design-system drift, accessibility issues, missing UX states, and low product specificity.

Status: pre-alpha scaffold. The current MVP focuses on deterministic checks for web UI source and fetched HTML. Screenshot, browser-rendered URL, and Figma adapters are planned extension points.

## Install

```bash
npm install
npm run build
npm link -w @unslop/cli
```

## Try It

```bash
unslop design check src/app/page.tsx
unslop design check --url http://localhost:3000 --json
unslop design plan src/app/page.tsx --product "TOPIK learning app"
unslop design fix src/app/page.tsx --safe
unslop design report --url http://localhost:3000 -o unslop-report.html
```

CI mode exits non-zero when the score is below the threshold:

```bash
unslop design check --url http://localhost:3000 --threshold 75 --ci
```

Agent mode reads stdin and returns a strict JSON decision:

```bash
cat design-output.html | unslop design agent-check --stdin --json
```

## MVP Rules

- Generic AI SaaS visual language: purple/cyan gradients, glow, glass cards, decorative orbs
- Card soup and weak hierarchy signals
- Generic UI copy: "Get Started", "Unlock your potential", "AI-powered insights"
- Design-system drift: arbitrary Tailwind values, ad-hoc hex colors, radius and shadow drift
- Accessibility basics: missing image alt text, icon-only buttons, unlabeled inputs, heading jumps
- Interaction readiness: missing loading, empty, error, disabled, or success states

## Philosophy

AI detection is unreliable. Design quality is inspectable.

`unslop` does not try to prove whether a screen was AI-generated. It checks whether the screen reflects product intent, brand constraints, accessibility, design-system discipline, and real user workflows.

## Roadmap

See [docs/roadmap.md](docs/roadmap.md).
