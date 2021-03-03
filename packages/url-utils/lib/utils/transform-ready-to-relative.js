// require the whatwg compatible URL library (same behaviour in node and browser)
const {URL} = require('url');
const deduplicateSubdirectory = require('./deduplicate-subdirectory');

const transformReadyToRelative = function transformReadyToRelative(url, root, _options = {}) {
    const defaultOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (url.indexOf(options.replacementStr) !== 0) {
        return url;
    }

    const rootURL = new URL(root);

    const transformedUrl = url
        .replace(options.replacementStr, rootURL.pathname || '')
        .replace(/\/\//g, '/');

    return deduplicateSubdirectory(transformedUrl, root);
};

module.exports = transformReadyToRelative;
