const htmlTransform = require('./_html-transform');
const absoluteToTransformReady = require('./absolute-to-transform-ready');

const htmlAbsoluteToTransformReady = function (html = '', siteUrl, _options) {
    const defaultOptions = {assetsOnly: false, ignoreProtocol: true};
    const options = Object.assign({}, defaultOptions, _options || {});

    // exit early and avoid parsing if the content does not contain the siteUrl
    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToRelative doesn't take that option
    const transformFunction = function (_url, _siteUrl, _itemPath, __options) {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return htmlTransform(html, siteUrl, transformFunction, '', options);
};

module.exports = htmlAbsoluteToTransformReady;
