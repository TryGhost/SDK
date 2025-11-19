const {URL} = require('url');
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

const absoluteToTransformReady = function (url, root, _options = {}) {
    const defaultOptions = {
        replacementStr: '__GHOST_URL__',
        withoutSubdirectory: true,
        staticImageUrlPrefix: 'content/images',
        staticFilesUrlPrefix: 'content/files',
        staticMediaUrlPrefix: 'content/media',
        imageBaseUrl: null,
        filesBaseUrl: null,
        mediaBaseUrl: null
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (isRelative(url)) {
        return url;
    }

    // convert to relative with stripped subdir
    // always returns root-relative starting with forward slash
    const rootRelativeUrl = absoluteToRelative(url, root, options);

    if (isRelative(rootRelativeUrl)) {
        return `${options.replacementStr}${rootRelativeUrl}`;
    }

    if (options.mediaBaseUrl) {
        const mediaRelativeUrl = absoluteToRelative(url, options.mediaBaseUrl, options);

        if (isRelative(mediaRelativeUrl)) {
            return `${options.replacementStr}${mediaRelativeUrl}`;
        }
    }

    if (options.filesBaseUrl) {
        const filesRelativeUrl = absoluteToRelative(url, options.filesBaseUrl, options);

        if (isRelative(filesRelativeUrl)) {
            return `${options.replacementStr}${filesRelativeUrl}`;
        }
    }

    if (options.imageBaseUrl) {
        const imageRelativeUrl = absoluteToRelative(url, options.imageBaseUrl, options);

        if (isRelative(imageRelativeUrl)) {
            return `${options.replacementStr}${imageRelativeUrl}`;
        }
    }

    return url;
};

module.exports = absoluteToTransformReady;
