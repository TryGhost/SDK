const absoluteToTransformReady = require('./absolute-to-transform-ready');

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const plaintextAbsoluteToTransformReady = function plaintextAbsoluteToTransformReady(plaintext, rootUrl, itemPath, options) {
    // itemPath is optional, if it's an object may be the options param instead
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = null;
    }

    // plaintext links look like "Link title [url]"
    // those links are all we care about so we can do a fast regex here
    const rootURL = new URL(rootUrl);
    const escapedRootUrl = escapeRegExp(`${rootURL.hostname}${rootURL.pathname.replace(/\/$/, '')}`);
    const linkRegex = new RegExp(` \\[(https?://${escapedRootUrl}.*?)\\]`, 'g');

    return plaintext.replace(linkRegex, function (fullMatch, url) {
        const newUrl = absoluteToTransformReady(`${url}`, rootUrl, options);
        return ` [${newUrl}]`;
    });
};

module.exports = plaintextAbsoluteToTransformReady;
