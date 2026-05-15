#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SCOPE:-}" ]]; then
    echo "Error: SCOPE is required (e.g. SCOPE=@tryghost/limit-service)" >&2
    exit 1
fi

BUMP="${BUMP:-patch}"
REMOTE="${GHOST_UPSTREAM:-origin}"
PKG_NAME="${SCOPE#@tryghost/}"
PKG_DIR="packages/${PKG_NAME}"

if [[ ! -f "${PKG_DIR}/package.json" ]]; then
    echo "Error: ${PKG_DIR}/package.json not found" >&2
    exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
    echo "Error: working tree is dirty — commit or stash first" >&2
    exit 1
fi

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "${CURRENT_BRANCH}" != "main" ]]; then
    echo "Error: must be on main (currently on ${CURRENT_BRANCH})" >&2
    exit 1
fi

echo "Bumping ${SCOPE} (${BUMP}) and publishing via tag…"

(cd "${PKG_DIR}" && npm --no-git-tag-version version "${BUMP}")

NEW_VERSION=$(node -p "require('./${PKG_DIR}/package.json').version")
TAG="${SCOPE}@${NEW_VERSION}"

git add "${PKG_DIR}/package.json"
git commit -m "Published new versions"
git tag "${TAG}"

echo "Pushing commit + tag ${TAG} to ${REMOTE}…"
git push "${REMOTE}" main
git push "${REMOTE}" "${TAG}"

echo "Done — CI will publish ${TAG} via ship:ci"
