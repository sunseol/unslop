#!/usr/bin/env bash
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner)}"
BRANCH="${BRANCH:-main}"
REQUIRED_CONTEXTS="${REQUIRED_CONTEXTS:-check (node 20.x),check (node 22.x),check (node 24.x),package dry-run}"
ENFORCE_ADMINS="${ENFORCE_ADMINS:-false}"
REQUIRED_APPROVALS="${REQUIRED_APPROVALS:-1}"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh is required. Install GitHub CLI and run gh auth login." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "gh is not authenticated. Run gh auth login first." >&2
  exit 1
fi

payload_file="$(mktemp)"
trap 'rm -f "$payload_file"' EXIT

REQUIRED_CONTEXTS="$REQUIRED_CONTEXTS" \
ENFORCE_ADMINS="$ENFORCE_ADMINS" \
REQUIRED_APPROVALS="$REQUIRED_APPROVALS" \
node --input-type=module >"$payload_file" <<'NODE'
const contexts = process.env.REQUIRED_CONTEXTS
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const enforceAdmins = process.env.ENFORCE_ADMINS === "true";
const requiredApprovals = Number(process.env.REQUIRED_APPROVALS || "1");

const payload = {
  required_status_checks: {
    strict: true,
    contexts
  },
  enforce_admins: enforceAdmins,
  required_pull_request_reviews: {
    dismiss_stale_reviews: true,
    require_code_owner_reviews: true,
    required_approving_review_count: requiredApprovals,
    require_last_push_approval: false
  },
  restrictions: null,
  required_linear_history: true,
  allow_force_pushes: false,
  allow_deletions: false,
  required_conversation_resolution: true,
  lock_branch: false,
  allow_fork_syncing: true
};

console.log(JSON.stringify(payload, null, 2));
NODE

echo "Applying branch protection to ${REPO}:${BRANCH}"
echo "Required checks: ${REQUIRED_CONTEXTS}"

gh api \
  --method PUT \
  -H "Accept: application/vnd.github+json" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  "repos/${REPO}/branches/${BRANCH}/protection" \
  --input "$payload_file" >/dev/null

echo "Branch protection applied."
