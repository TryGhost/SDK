const lexicalRelativeToAbsolute = require('./lexical-relative-to-absolute');
const lexicalAbsoluteToTransformReady = require('./lexical-absolute-to-transform-ready');

function lexicalToTransformReady(lexical, siteUrl, itemPath, options) {
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = null;
    }
    const absolute = lexicalRelativeToAbsolute(lexical, siteUrl, itemPath, options);
    return lexicalAbsoluteToTransformReady(absolute, siteUrl, options);
}

module.exports = lexicalToTransformReady;
