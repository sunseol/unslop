# ADR 0001: Repository Governance Scaffold

## Status

Accepted

## Context

`unslop` is moving from initial scaffold to real project execution. The repository needs a collaboration baseline before feature development starts: CI, branch protection, PR rules, ownership, and release gates.

## Decision

Use GitHub-native collaboration scaffolding:

- GitHub Actions CI on PRs and `main`
- manual release workflow with environment-gated npm publish
- CODEOWNERS for repository ownership
- issue and PR templates
- Dependabot for npm and GitHub Actions
- scriptable `main` branch protection through GitHub CLI
- documented working tree and PR rules

## Constraints

- v0.1 must remain local-only by default.
- CI must not require secrets.
- npm publish must be manual and environment-gated.
- Branch protection should be reproducible from the repository.
- Solo-maintainer bootstrap must not deadlock on CODEOWNERS review.

## Rejected

- Auto-publish on tags | too risky before versioning and release notes are mature.
- Enforcing branch protection immediately in this scaffold | it can block current setup work before required checks have run.
- Adding broad security scanners now | current dependency footprint is minimal, and CI should stay fast.

## Consequences

- Contributors get clear expectations before opening PRs.
- `main` can be protected after the first CI run confirms check names.
- Administrator enforcement stays off by default until a second maintainer or reviewer path exists.
- Release publishing requires explicit maintainer action and `NPM_TOKEN`.
- Future governance changes should update this ADR or add a new one.
