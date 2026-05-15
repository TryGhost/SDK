#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SCOPE:-}" ]]; then
    echo "Error: SCOPE is required (e.g. SCOPE=@tryghost/limit-service)" >&2
    exit 1
fi

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

CURRENT_VERSION=$(node -p "require('./${PKG_DIR}/package.json').version")

preview() {
    node -e "try { console.log(require('semver').inc('${CURRENT_VERSION}', '$1')); } catch (e) { console.log('?'); }"
}

if [[ -z "${BUMP:-}" ]]; then
    if [[ ! -t 0 ]]; then
        echo "Error: BUMP not set and no TTY for prompting (e.g. BUMP=patch)" >&2
        exit 1
    fi
    PATCH_NEXT=$(preview patch)
    MINOR_NEXT=$(preview minor)
    MAJOR_NEXT=$(preview major)
    echo ""
    echo "Current ${SCOPE}: ${CURRENT_VERSION}"
    echo "Select release type:"
    echo "  1) patch  (${CURRENT_VERSION} → ${PATCH_NEXT})"
    echo "  2) minor  (${CURRENT_VERSION} → ${MINOR_NEXT})"
    echo "  3) major  (${CURRENT_VERSION} → ${MAJOR_NEXT})"
    echo "  4) custom version"
    read -r -p "Choice [1-4]: " CHOICE
    case "${CHOICE}" in
        1) BUMP=patch ;;
        2) BUMP=minor ;;
        3) BUMP=major ;;
        4) read -r -p "Version: " BUMP ;;
        *) echo "Invalid selection" >&2; exit 1 ;;
    esac
fi

(cd "${PKG_DIR}" && npm --no-git-tag-version version "${BUMP}" > /dev/null)

NEW_VERSION=$(node -p "require('./${PKG_DIR}/package.json').version")
TAG="${SCOPE}@${NEW_VERSION}"

echo ""
echo "About to: bump ${SCOPE} ${CURRENT_VERSION} → ${NEW_VERSION},"
echo "          commit, tag ${TAG}, and push to ${REMOTE}/main."
if [[ -t 0 ]]; then
    read -r -p "Proceed? [y/N]: " CONFIRM
    if [[ "${CONFIRM}" != "y" && "${CONFIRM}" != "Y" ]]; then
        echo "Aborted — reverting version bump"
        git checkout -- "${PKG_DIR}/package.json"
        exit 1
    fi
fi

git add "${PKG_DIR}/package.json"
git commit -m "Published new versions"
git tag "${TAG}"

echo "Pushing commit + tag ${TAG} to ${REMOTE}…"
git push "${REMOTE}" main
git push "${REMOTE}" "${TAG}"

echo "Done — CI will publish ${TAG} via ship:ci"
