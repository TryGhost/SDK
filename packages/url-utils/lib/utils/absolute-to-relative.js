// require the whatwg compatible URL library (same behaviour in node and browser)
const {URL} = require('url');

/**
 * Convert an absolute URL to a root-relative path if it matches the supplied root domain.
 *
 * @param {string} url Absolute URL to convert to relative if possible
 * @param {string} rootUrl Absolute URL to which the returned relative URL will match the domain root
 * @param {Object} [options] Options that affect the conversion
 * @param {boolean} [options.ignoreProtocol] Ignore protocol when matching url to root
 * @returns {string} The passed-in url or root-relative path
 */
const absoluteToRelative = function absoluteToRelative(url, rootUrl, options = {ignoreProtocol: true}) {
    const parsedUrl = new URL(url, 'http://relative');
    const parsedRoot = new URL(rootUrl);

    // return the url as-is if it was relative
    if (parsedUrl.origin === 'http://relative') {
        return url;
    }

    const matchesHost = parsedUrl.host === parsedRoot.host;
    const matchesProtocol = parsedUrl.protocol === parsedRoot.protocol;
    const matchesPath = parsedUrl.pathname.indexOf(parsedRoot.pathname) === 0;

    if (matchesHost && (options.ignoreProtocol || matchesProtocol) && matchesPath) {
        return parsedUrl.href.replace(parsedUrl.origin, '');
    }

    return url;
};

module.exports = absoluteToRelative;
