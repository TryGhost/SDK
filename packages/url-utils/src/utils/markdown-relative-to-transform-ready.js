const markdownTransform = require('./markdown-transform');
const htmlRelativeToTransformReady = require('./html-relative-to-transform-ready');
const relativeToTransformReady = require('./relative-to-transform-ready');

function markdownRelativeToTransformReady(markdown = '', siteUrl, itemPath, _options = {}) {
    const defaultOptions = {assetsOnly: false};
    const options = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = '\\]\\([^\\s\\)]|href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    const transformFunctions = {
        html: htmlRelativeToTransformReady,
        url: relativeToTransformReady
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, itemPath, options);
}

module.exports = markdownRelativeToTransformReady;
