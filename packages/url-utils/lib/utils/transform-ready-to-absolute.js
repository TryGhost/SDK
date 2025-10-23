function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function trimTrailingSlash(url) {
    if (!url) {
        return url;
    }
    return url.replace(/\/+$/, '');
}

const transformReadyToAbsolute = function (str = '', root, _options = {}) {
    const defaultOptions = {
        replacementStr: '__GHOST_URL__',
        staticImageUrlPrefix: 'content/images',
        staticFilesUrlPrefix: 'content/files',
        staticMediaUrlPrefix: 'content/media',
        imageBaseUrl: null,
        filesBaseUrl: null,
        mediaBaseUrl: null
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (!str || str.indexOf(options.replacementStr) === -1) {
        return str;
    }

    const replacementRegex = new RegExp(escapeRegExp(options.replacementStr), 'g');
    const fallbackBase = trimTrailingSlash(options.imageBaseUrl || root);
    const mediaBase = trimTrailingSlash(options.mediaBaseUrl);
    const filesBase = trimTrailingSlash(options.filesBaseUrl);
    const imageBase = trimTrailingSlash(options.imageBaseUrl) || fallbackBase;

    return str.replace(replacementRegex, (match, offset) => {
        const remainder = str.slice(offset + match.length);

        if (options.staticMediaUrlPrefix && remainder.startsWith(`/${options.staticMediaUrlPrefix}`) && mediaBase) {
            return mediaBase;
        }

        if (options.staticFilesUrlPrefix && remainder.startsWith(`/${options.staticFilesUrlPrefix}`) && filesBase) {
            return filesBase;
        }

        if (options.staticImageUrlPrefix && remainder.startsWith(`/${options.staticImageUrlPrefix}`) && imageBase) {
            return imageBase;
        }

        return fallbackBase;
    });
};

module.exports = transformReadyToAbsolute;
