const deduplicateSubdirectory = require('./deduplicate-subdirectory');

const transformReadyToAbsolute = function transformReadyToAbsolute(url, root, _options = {}) {
    const defaultOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (url.indexOf(options.replacementStr) !== 0) {
        return url;
    }

    const transformedUrl = url
        .replace(options.replacementStr, root)
        .replace(/([^:])\/\//g, '$1/');

    return deduplicateSubdirectory(transformedUrl, root);
};

module.exports = transformReadyToAbsolute;
