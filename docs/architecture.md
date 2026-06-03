# Architecture

`unslop` starts as a deterministic CLI with adapter boundaries for richer analysis later.

```text
unslop
  core
    rule-engine
    scoring
    report-generator
    fix-planner
  adapters
    code
    browser-url
    screenshot
    figma
    design-tokens
  rules
    visual-cliche
    accessibility
    design-system
    product-intent
    ui-copy
    implementation
```

## Current MVP

The initial package, `@unslop/cli`, runs deterministic analysis over:

- local source files and directories
- basic glob-like file patterns
- fetched URL HTML through Node's built-in `fetch`
- stdin for agent workflows

## Adapter Strategy

The source scanner is intentionally simple. Browser-rendered URL checks, screenshots, and Figma files should arrive as adapters that produce the same normalized `AuditInput` shape.

## Scoring Strategy

Rules emit findings across product and design axes. Scoring starts from 100 per axis and subtracts severity-weighted penalties. This keeps scoring explainable and stable enough for CI.
