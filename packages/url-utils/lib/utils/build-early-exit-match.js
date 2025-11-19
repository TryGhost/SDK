function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a regex pattern that matches any of the configured base URLs (site URL + CDN URLs).
 * This is used for early exit optimizations - if content doesn't contain any of these URLs,
 * we can skip expensive parsing.
 *
 * @param {string} siteUrl - The site's base URL
 * @param {Object} options - Options containing CDN base URLs
 * @param {string} [options.imageBaseUrl] - CDN base URL for images
 * @param {string} [options.filesBaseUrl] - CDN base URL for files
 * @param {string} [options.mediaBaseUrl] - CDN base URL for media
 * @param {boolean} [options.ignoreProtocol=true] - Whether to strip protocol from URLs
 * @returns {string|null} Regex pattern matching any configured base URL, or null if none configured
 */
function buildEarlyExitMatch(siteUrl, options = {}) {
    const candidates = [siteUrl, options.imageBaseUrl, options.filesBaseUrl, options.mediaBaseUrl]
        .filter(Boolean)
        .map((value) => {
            let normalized = options.ignoreProtocol ? value.replace(/http:|https:/, '') : value;
            return normalized.replace(/\/$/, '');
        })
        .filter(Boolean)
        .map(escapeRegExp);

    if (!candidates.length) {
        return null;
    }

    if (candidates.length === 1) {
        return candidates[0];
    }

    return `(?:${candidates.join('|')})`;
}

module.exports = {
    buildEarlyExitMatch,
    escapeRegExp
};
