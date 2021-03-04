const markdownTransform = require('./_markdown-transform');
const absoluteToTransformReady = require('./absolute-to-transform-ready');
const htmlAbsoluteToTransformReady = require('./html-absolute-to-transform-ready');

function markdownAbsoluteToTransformReady(markdown = '', siteUrl, _options = {}) {
    const defaultOptions = {assetsOnly: false, ignoreProtocol: true};
    const options = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToTransformReady functions doen't take that option
    const transformFunctions = {
        html(_url, _siteUrl, _itemPath, __options) {
            return htmlAbsoluteToTransformReady(_url, _siteUrl, __options);
        },
        url(_url, _siteUrl, _itemPath, __options) {
            return absoluteToTransformReady(_url, _siteUrl, __options);
        }
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, '', options);
}

module.exports = markdownAbsoluteToTransformReady;
