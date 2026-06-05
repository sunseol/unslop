# Branch Protection

The protected branch is `main`.

## Protection Policy

`main` should require:

- pull request before merge
- 1 approving review
- CODEOWNERS review
- stale review dismissal
- resolved conversations
- up-to-date branch
- linear history
- required status checks
- blocked force pushes
- blocked deletion
- admin bypass during solo-maintainer bootstrap
- admin enforcement after a second maintainer or reviewer path exists

## Required Status Checks

Expected check contexts:

- `check (node 20.x)`
- `check (node 22.x)`
- `check (node 24.x)`
- `package dry-run`

Check names come from `.github/workflows/ci.yml`. Confirm the exact names after the first CI run.

## Apply

```bash
scripts/github/apply-main-branch-protection.sh sunseol/unslop
```

The default script keeps `ENFORCE_ADMINS=false` to avoid blocking a solo maintainer behind a CODEOWNERS review requirement. After reviewer coverage exists, apply with:

```bash
ENFORCE_ADMINS=true scripts/github/apply-main-branch-protection.sh sunseol/unslop
```

## Verify

```bash
scripts/github/verify-main-branch-protection.sh sunseol/unslop
```

## Emergency Changes

If branch protection blocks an urgent fix:

1. Create a hotfix branch.
2. Open a PR with the smallest possible diff.
3. Keep required checks enabled.
4. If admin bypass is unavoidable, record why in the PR and follow up with a normal PR restoring the policy.
