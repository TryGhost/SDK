const plaintextRelativeToTransformReady = require('./plaintext-relative-to-transform-ready');
const plaintextAbsoluteToTransformReady = require('./plaintext-absolute-to-transform-ready');

function plaintextToTransformReady(plaintext, siteUrl, itemPath, options) {
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = null;
    }
    const relativeTransformed = plaintextRelativeToTransformReady(plaintext, siteUrl, itemPath, options);
    return plaintextAbsoluteToTransformReady(relativeTransformed, siteUrl, options);
}

module.exports = plaintextToTransformReady;
