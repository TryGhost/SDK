// Verbatim copy of the @tryghost/url-utils@5.3.0 implementation, used to check
// the optimised implementation produces identical output. Not shipped.

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

// similar to Object.assign but will not override defaults if a source value is undefined
function assignOptions(target, ...sources) {
    const options = sources.map((x) => {
        return Object.entries(x)
            .filter(([, value]) => value !== undefined)
            .reduce((obj, [key, value]) => (obj[key] = value, obj), {});
    });
    return Object.assign(target, ...options);
}

// UrlUtils#transformReadyToAbsolute from 5.3.0, `config` mirrors the instance's
// static prefixes and asset base urls
function urlUtilsTransformReadyToAbsolute(config, url, options) {
    const assetDefaults = {
        staticImageUrlPrefix: config.staticImageUrlPrefix || 'content/images',
        staticFilesUrlPrefix: config.staticFilesUrlPrefix || 'content/files',
        staticMediaUrlPrefix: config.staticMediaUrlPrefix || 'content/media',
        imageBaseUrl: (config.assetBaseUrls && config.assetBaseUrls.image) || null,
        filesBaseUrl: (config.assetBaseUrls && config.assetBaseUrls.files) || null,
        mediaBaseUrl: (config.assetBaseUrls && config.assetBaseUrls.media) || null
    };
    const _options = assignOptions({}, assetDefaults, {}, options || {});
    return transformReadyToAbsolute(url, config.siteUrl, _options);
}

module.exports = {
    transformReadyToAbsolute,
    urlUtilsTransformReadyToAbsolute
};
