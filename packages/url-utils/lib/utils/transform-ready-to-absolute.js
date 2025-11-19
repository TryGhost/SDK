function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

    return str.replace(replacementRegex, (match, offset) => {
        const remainder = str.slice(offset + match.length);

        if (remainder.startsWith(`/${options.staticMediaUrlPrefix}`) && options.mediaBaseUrl) {
            return options.mediaBaseUrl.replace(/\/$/, '');
        }

        if (remainder.startsWith(`/${options.staticFilesUrlPrefix}`) && options.filesBaseUrl) {
            return options.filesBaseUrl.replace(/\/$/, '');
        }

        if (remainder.startsWith(`/${options.staticImageUrlPrefix}`) && options.imageBaseUrl) {
            return options.imageBaseUrl.replace(/\/$/, '');
        }

        return root.replace(/\/$/, '');
    });
};

module.exports = transformReadyToAbsolute;
