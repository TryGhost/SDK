const markdownTransform = require('./markdown-transform');
const absoluteToRelative = require('./absolute-to-relative');
const htmlAbsoluteToRelative = require('./html-absolute-to-relative');

function markdownAbsoluteToRelative(markdown = '', siteUrl, _options = {}) {
    const defaultOptions = {assetsOnly: false, ignoreProtocol: true};
    const options = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToRelative functions doen't take that option
    const transformFunctions = {
        html(_url, _siteUrl, _itemPath, __options) {
            return htmlAbsoluteToRelative(_url, _siteUrl, __options);
        },
        url(_url, _siteUrl, _itemPath, __options) {
            return absoluteToRelative(_url, _siteUrl, __options);
        }
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, '', options);
}

module.exports = markdownAbsoluteToRelative;
