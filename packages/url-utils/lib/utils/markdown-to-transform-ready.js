const markdownRelativeToAbsolute = require('./markdown-relative-to-absolute');
const markdownAbsoluteToTransformReady = require('./markdown-absolute-to-transform-ready');

function markdownToTransformReady(markdown, siteUrl, itemPath, options) {
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = null;
    }
    const absolute = markdownRelativeToAbsolute(markdown, siteUrl, itemPath, options);
    return markdownAbsoluteToTransformReady(absolute, siteUrl, options);
}

module.exports = markdownToTransformReady;
