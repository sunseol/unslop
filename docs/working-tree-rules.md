# Working Tree Rules

These rules keep local work reviewable and prevent repository noise from entering PRs.

## Branches

- Work on a feature branch, not `main`.
- Use `codex/<short-description>` for Codex-authored branches.
- Sync from `main` before opening a PR.

## Files

Do not commit:

- `.omx/`
- `node_modules/`
- `dist/`
- coverage output
- generated tarballs
- local HTML reports
- secrets or tokens

Commit:

- source
- tests
- docs
- fixtures
- workflow and governance files

## Local Verification

Run:

```bash
npm run check
```

For package or release changes, also run:

```bash
npm run pack:dry-run
```

## Dependency Changes

Before adding a dependency, document:

- why existing Node APIs or local helpers are insufficient
- whether it is runtime or development only
- size and maintenance risk
- security implications

## Generated Output

Generated output belongs in git only when it is a source fixture, golden output, or required package metadata. Build output does not belong in git.
