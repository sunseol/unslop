# Contributing

`unslop` is early-stage. Keep contributions small, testable, and grounded in the product direction: restore design intent instead of trying to detect AI authorship.

## Development

```bash
npm install
npm run build
npm test
npm run lint
```

## Guidelines

- Prefer deterministic rules before model-backed checks.
- Keep rule output actionable: every finding needs evidence and a suggested fix.
- Separate safe fixes, suggested fixes, and human-review changes.
- Avoid new runtime dependencies unless they unlock a concrete adapter or quality check.
- Add fixtures or tests for each new rule family.
