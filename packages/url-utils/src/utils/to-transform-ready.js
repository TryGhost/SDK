const relativeToAbsolute = require('./relative-to-absolute');
const absoluteToTransformReady = require('./absolute-to-transform-ready');

function toTransformReady(url, siteUrl, itemPath, options) {
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = null;
    }
    const absoluteUrl = relativeToAbsolute(url, siteUrl, itemPath, options);
    return absoluteToTransformReady(absoluteUrl, siteUrl, options);
}

module.exports = toTransformReady;
