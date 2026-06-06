# Repository Governance

This document defines the collaboration scaffold for `unslop`: CI/CD, branch protection, pull request rules, working tree rules, and release gates.

## Goals

- Keep `main` releasable.
- Require all product and rule changes to pass the same checks locally and in CI.
- Make false positives, external data transfer, and rule changes reviewable.
- Keep v0.1 local-only by default: no telemetry, no external API, no automatic writes.

## Branch Model

- `main` is the protected default branch.
- Feature branches use `codex/<short-description>` or `<owner>/<short-description>`.
- Release preparation branches use `release/<version>`.
- Hotfix branches use `hotfix/<short-description>`.

Do not commit directly to `main` once branch protection is enabled. Use pull requests.

## Required CI

The required checks for `main` are:

- `check (node 20.x)`
- `check (node 22.x)`
- `check (node 24.x)`
- `package dry-run`

The CI workflow runs on pull requests, pushes to `main`, and manual dispatch.

## Branch Protection Design

Recommended `main` protection:

- Require a pull request before merging.
- Require 1 approving review.
- Require CODEOWNERS review.
- Dismiss stale approvals after new commits.
- Require all conversations to be resolved.
- Require branches to be up to date before merging.
- Require linear history.
- Require the CI checks listed above.
- Block force pushes.
- Block branch deletion.
- Do not enforce rules for administrators during solo-maintainer bootstrap.
- Enforce rules for administrators after a second maintainer or reviewer path exists.

Apply with:

```bash
scripts/github/apply-main-branch-protection.sh sunseol/unslop
```

Verify with:

```bash
scripts/github/verify-main-branch-protection.sh sunseol/unslop
```

If GitHub check context names differ after the first CI run, set `REQUIRED_CONTEXTS` explicitly:

```bash
REQUIRED_CONTEXTS="check (node 20.x),check (node 22.x),check (node 24.x),package dry-run" \
  scripts/github/apply-main-branch-protection.sh sunseol/unslop
```

To enforce rules for administrators after reviewer coverage exists:

```bash
ENFORCE_ADMINS=true scripts/github/apply-main-branch-protection.sh sunseol/unslop
```

## Pull Request Rules

Every PR should include:

- a short summary of what changed and why
- scope classification
- verification evidence
- risk notes
- documentation updates when behavior or workflow changes

Rule or scoring PRs must include:

- pass and fail fixtures
- JSON output impact, if schema changes
- false-positive considerations
- documentation update when user-facing behavior changes

CI/CD or repository governance PRs must include:

- what workflow or protection changes
- rollback path
- whether secrets, environments, or permissions are required

## Working Tree Rules

- Keep unrelated changes out of the same PR.
- Do not commit `.omx/`, logs, local caches, generated tarballs, or local reports.
- Prefer small, reversible commits with clear intent.
- Run `npm run check` before opening a PR.
- Run `npm run pack:dry-run` before release-related PRs.
- Do not introduce new runtime dependencies without a short rationale in the PR.
- Do not add telemetry or external API calls without explicit product approval and documentation.
- Do not implement automatic writes without `--write` and a safety review.

## Commit Message Rules

Use the Lore commit protocol from the workspace guidance. The first line should explain why the change exists, not just what changed.

Recommended trailers:

- `Constraint:`
- `Rejected:`
- `Confidence:`
- `Scope-risk:`
- `Directive:`
- `Tested:`
- `Not-tested:`

## Release Gate

The `Release` workflow is manual. It always validates first, and publishes only when the `publish` input is true.

Publishing requires:

- `npm-production` GitHub environment approval
- `NPM_TOKEN` repository or environment secret
- `npm run check`
- `npm run pack:dry-run`

Do not publish `0.0.0` packages. Create a release branch or PR that updates package versions and release notes first.

## Secrets and Environments

Required only for publishing:

- `NPM_TOKEN`

Recommended environment:

- `npm-production`

The CI workflow does not need secrets.

## Merge Policy

Preferred merge method:

- squash merge for normal PRs
- rebase merge only for clean mechanical branches
- merge commits only for release trains that intentionally preserve branch structure

Delete feature branches after merge.
