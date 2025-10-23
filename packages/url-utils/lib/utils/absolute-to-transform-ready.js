const {URL} = require('url');
const absoluteToRelative = require('./absolute-to-relative');

function normalizeBaseUrl(baseUrl) {
    if (!baseUrl) {
        return null;
    }

    try {
        const parsed = new URL(baseUrl);
        let pathname = parsed.pathname.replace(/\/$/, '');
        if (pathname === '/') {
            pathname = '';
        }

        return {
            origin: parsed.origin,
            pathname
        };
    } catch (e) {
        return null;
    }
}

function matchCdnBase(parsedUrl, options) {
    const candidates = [
        {base: normalizeBaseUrl(options.mediaBaseUrl), prefix: options.staticMediaUrlPrefix},
        {base: normalizeBaseUrl(options.filesBaseUrl), prefix: options.staticFilesUrlPrefix}
    ];

    for (const candidate of candidates) {
        if (!candidate.base || !candidate.prefix) {
            continue;
        }

        if (parsedUrl.origin !== candidate.base.origin) {
            continue;
        }

        let pathname = parsedUrl.pathname;
        const basePath = candidate.base.pathname;

        if (basePath) {
            if (pathname === basePath) {
                pathname = '/';
            } else if (pathname.startsWith(basePath + '/')) {
                pathname = pathname.slice(basePath.length);
            } else {
                continue;
            }
        }

        if (!pathname.startsWith('/')) {
            pathname = `/${pathname}`;
        }

        if (!pathname.startsWith(`/${candidate.prefix}`)) {
            continue;
        }

        return `${pathname}${parsedUrl.search}${parsedUrl.hash}`;
    }

    return null;
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

    let parsedInput;
    try {
        parsedInput = new URL(url, 'http://relative');
    } catch (e) {
        // url was unparseable
        return url;
    }

    if (parsedInput.origin !== 'http://relative') {
        const cdnMatch = matchCdnBase(parsedInput, options);
        if (cdnMatch) {
            return `${options.replacementStr}${cdnMatch}`;
        }
    }

    if (parsedInput.origin === 'http://relative') {
        return url;
    }

    // convert to relative with stripped subdir
    // always returns root-relative starting with forward slash
    const relativeUrl = absoluteToRelative(url, root, options);

    // return still absolute urls as-is (eg. external site, mailto, etc)
    try {
        const parsedURL = new URL(relativeUrl, 'http://relative');
        if (parsedURL.origin !== 'http://relative') {
            return url;
        }
    } catch (e) {
        // url was unparseable
        return url;
    }

    return `${options.replacementStr}${relativeUrl}`;
};

module.exports = absoluteToTransformReady;
