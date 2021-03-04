const relativeToAbsolute = require('./relative-to-absolute');

const relativeToTransformReady = function (url, root, itemPath, _options) {
    // itemPath is optional, if it's an object may be the options param instead
    if (typeof itemPath === 'object' && !_options) {
        _options = itemPath;
        itemPath = null;
    }

    const defaultOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const overrideOptions = {
        secure: false
    };
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    // convert to absolute
    const absoluteUrl = relativeToAbsolute(url, root, itemPath, options);

    if (absoluteUrl === url) {
        return url;
    }

    // replace root with replacement string
    const transformedUrl = absoluteUrl
        .replace(root, `${options.replacementStr}/`) // always have trailing slash after magic string
        .replace(/([^:])\/\//g, '$1/');

    return transformedUrl;
};

module.exports = relativeToTransformReady;
