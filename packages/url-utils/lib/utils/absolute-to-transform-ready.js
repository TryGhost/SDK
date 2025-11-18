const absoluteToRelative = require('./absolute-to-relative');

function isRelative(url) {
    let parsedInput;
    try {
        parsedInput = new URL(url, 'http://relative');
    } catch (e) {
        // url was unparseable
        return false;
    }

    return parsedInput.origin === 'http://relative';
}

const absoluteToTransformReady = function (url, root, _options) {
    const defaultOptions = {
        replacementStr: '__GHOST_URL__',
        withoutSubdirectory: true
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (isRelative(url)) {
        return url;
    }

    // convert to relative with stripped subdir
    // always returns root-relative starting with forward slash
    const relativeUrl = absoluteToRelative(url, root, options);

    // return still absolute urls as-is (eg. external site, mailto, etc)
    if (isRelative(relativeUrl)) {
        return `${options.replacementStr}${relativeUrl}`;
    }

    return url;
};

module.exports = absoluteToTransformReady;
