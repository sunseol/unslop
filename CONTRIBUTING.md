# Contributing

`unslop` is early-stage. Keep contributions small, testable, and grounded in the product direction: restore design intent instead of trying to detect AI authorship.

## Development

```bash
npm install
npm run build
npm test
npm run lint
npm run pack:dry-run
```

## Guidelines

- Prefer deterministic rules before model-backed checks.
- Keep rule output actionable: every finding needs evidence and a suggested fix.
- Separate safe fixes, suggested fixes, and human-review changes.
- Avoid new runtime dependencies unless they unlock a concrete adapter or quality check.
- Add fixtures or tests for each new rule family.

## Repository Workflow

- Work on a feature branch, not `main`.
- Open a pull request for all changes once branch protection is enabled.
- Follow [docs/working-tree-rules.md](docs/working-tree-rules.md).
- Follow [docs/pr-rules.md](docs/pr-rules.md).
- See [docs/repository-governance.md](docs/repository-governance.md) for CI/CD, release, and branch protection policy.
