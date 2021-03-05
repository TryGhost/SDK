const htmlRelativeToAbsolute = require('./html-relative-to-absolute');
const htmlAbsoluteToTransformReady = require('./html-absolute-to-transform-ready');

function htmlToTransformReady(html, siteUrl, itemPath, options) {
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = null;
    }
    const absolute = htmlRelativeToAbsolute(html, siteUrl, itemPath, options);
    return htmlAbsoluteToTransformReady(absolute, siteUrl, options);
}

module.exports = htmlToTransformReady;
