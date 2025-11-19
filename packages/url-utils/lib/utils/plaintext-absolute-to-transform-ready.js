const absoluteToTransformReady = require('./absolute-to-transform-ready');
const {escapeRegExp} = require('./build-early-exit-match');

function buildLinkRegex(rootUrl, options = {}) {
    // Build a regex that matches links from ANY configured base URL (site + CDNs)
    const baseUrls = [rootUrl, options.imageBaseUrl, options.filesBaseUrl, options.mediaBaseUrl]
        .filter(Boolean);

    const patterns = baseUrls.map((baseUrl) => {
        const parsed = new URL(baseUrl);
        const escapedUrl = escapeRegExp(`${parsed.hostname}${parsed.pathname.replace(/\/$/, '')}`);
        return escapedUrl;
    });

    if (!patterns.length) {
        return null;
    }

    const pattern = patterns.length === 1 ? patterns[0] : `(?:${patterns.join('|')})`;
    return new RegExp(` \\[(https?://${pattern}.*?)\\]`, 'g');
}

const plaintextAbsoluteToTransformReady = function plaintextAbsoluteToTransformReady(plaintext, rootUrl, itemPath, options) {
    // itemPath is optional, if it's an object may be the options param instead
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = null;
    }

    // plaintext links look like "Link title [url]"
    // those links are all we care about so we can do a fast regex here
    const linkRegex = buildLinkRegex(rootUrl, options);

    return plaintext.replace(linkRegex, function (fullMatch, url) {
        const newUrl = absoluteToTransformReady(`${url}`, rootUrl, options);
        return ` [${newUrl}]`;
    });
};

module.exports = plaintextAbsoluteToTransformReady;
