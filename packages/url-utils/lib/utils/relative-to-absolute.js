// require the whatwg compatible URL library (same behaviour in node and browser)
const {URL} = require('url');

/**
 * Convert a root-relative path to an absolute URL based on the supplied root.
 * Will _only_ convert root-relative urls (/some/path not some/path)
 *
 * @param {string} path
 * @param {string} rootUrl
 * @returns {string} The passed in url or an absolute URL using
 */
const relativeToAbsolute = function relativeToAbsolute(path, rootUrl) {
    // return the path as-is if it's a pure hash/query param
    if (path.match(/^[#?]/)) {
        return path;
    }

    // return the path as-is if it's not root-relative
    if (!path.match(/^\//)) {
        return path;
    }

    // return the path as-is if it's absolute
    if (path.match(/^https?:\/\/|\/\//)) {
        return path;
    }

    // force root to always have a trailing-slash for consistent behaviour
    if (!rootUrl.endsWith('/')) {
        rootUrl = `${rootUrl}/`;
    }

    const parsedUrl = new URL(path, rootUrl);

    return parsedUrl.href;
};

module.exports = relativeToAbsolute;
