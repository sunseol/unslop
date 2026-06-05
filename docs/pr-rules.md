# Pull Request Rules

## Required Before Opening

- Run `npm run check`.
- Run `npm run pack:dry-run` when package contents, build output, package metadata, or release workflow changes.
- Update docs when behavior, CLI output, config, repository workflow, or roadmap changes.
- Keep `.omx/` and local artifacts out of the PR.

## PR Size

Prefer small PRs with one clear purpose. Split changes when a PR mixes:

- product behavior
- rule/scoring changes
- repository governance
- release workflow
- broad documentation edits

## Rule Changes

Rule PRs must include:

- a specific rule ID
- a pass fixture
- a fail fixture
- expected finding severity
- expected confidence behavior when relevant
- false-positive handling

Do not add high or blocking findings for purely stylistic choices. High severity should require a meaningful product-readiness risk.

## JSON Schema Changes

JSON output changes must include:

- `schema_version` behavior
- migration notes when fields are removed or renamed
- snapshot or fixture updates

## External Data Transfer

Any PR that sends user code, screenshots, HTML, DOM, CSS, or report data outside the local machine must include:

- explicit opt-in behavior
- documentation
- privacy/security rationale
- tests or safeguards showing the default remains local-only

## Review Focus

Reviewers should prioritize:

- incorrect findings
- false positives that would erode trust
- CI failures or flaky tests
- unsafe write behavior
- accidental data exfiltration
- undocumented CLI behavior
