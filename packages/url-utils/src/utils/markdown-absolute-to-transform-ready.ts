// @ts-nocheck
const markdownTransform = require('./markdown-transform');
import absoluteToTransformReady from './absolute-to-transform-ready';
import htmlAbsoluteToTransformReady from './html-absolute-to-transform-ready';
import buildEarlyExitMatchModule from './build-early-exit-match';
const {buildEarlyExitMatch} = buildEarlyExitMatchModule;

function markdownAbsoluteToTransformReady(markdown = '', siteUrl, _options = {}) {
    const defaultOptions = {assetsOnly: false, ignoreProtocol: true};
    const options = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = buildEarlyExitMatch(siteUrl, options);

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
