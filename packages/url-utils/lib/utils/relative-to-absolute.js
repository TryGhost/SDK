// require the whatwg compatible URL library (same behaviour in node and browser)
const {URL} = require('url');
const urlJoin = require('./url-join');

/**
 * Convert a root-relative path to an absolute URL based on the supplied root.
 * Will _only_ convert root-relative urls (/some/path not some/path)
 *
 * @param {string} path
 * @param {string} rootUrl
 * @param {string} itemPath
 * @param {object} options
 * @returns {string} The passed in url or an absolute URL using
 */
const relativeToAbsolute = function relativeToAbsolute(path, rootUrl, itemPath, _options) {
    // itemPath is optional, if it's an object it may be the options param instead
    if (typeof itemPath === 'object' && !_options) {
        _options = itemPath;
        itemPath = null;
    }

    const defaultOptions = {};
    const options = Object.assign({}, defaultOptions, _options);

    // if URL is absolute return it as-is
    try {
        const parsed = new URL(path, 'http://relative');

        if (parsed.origin !== 'http://relative') {
            return path;
        }

        // Do not convert protocol relative URLs
        if (path.lastIndexOf('//', 0) === 0) {
            return path;
        }
    } catch (e) {
        return path;
    }

    // return the path as-is if it's a pure hash param
    if (path.startsWith('#')) {
        return path;
    }

    // return the path as-is if it's not root-relative and we have no itemPath
    if (!itemPath && !path.match(/^\//)) {
        return path;
    }

    // return the path as-is if it's not an asset path and we're only modifying assets
    const staticImageUrlPrefixRegex = new RegExp(options.staticImageUrlPrefix);
    if (options.assetsOnly && !path.match(staticImageUrlPrefixRegex)) {
        return path;
    }

    // force root to always have a trailing-slash for consistent behaviour
    if (!rootUrl.endsWith('/')) {
        rootUrl = `${rootUrl}/`;
    }

    const basePath = path.startsWith('/') ? '' : itemPath;
    const absoluteUrl = new URL(urlJoin(['/', basePath, path], {rootUrl}), rootUrl);

    if (options.secure) {
        absoluteUrl.protocol = 'https:';
    }

    return absoluteUrl.toString();
};

module.exports = relativeToAbsolute;
