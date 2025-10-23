const htmlTransform = require('./html-transform');
const absoluteToTransformReady = require('./absolute-to-transform-ready');

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildEarlyExitMatch(siteUrl, options) {
    const candidates = [siteUrl, options.imageBaseUrl, options.filesBaseUrl, options.mediaBaseUrl]
        .filter(Boolean)
        .map((value) => {
            let normalized = options.ignoreProtocol ? value.replace(/http:|https:/, '') : value;
            return normalized.replace(/\/$/, '');
        })
        .filter(Boolean)
        .map(escapeRegExp);

    if (!candidates.length) {
        return null;
    }

    if (candidates.length === 1) {
        return candidates[0];
    }

    return `(?:${candidates.join('|')})`;
}

const htmlAbsoluteToTransformReady = function (html = '', siteUrl, _options) {
    const defaultOptions = {assetsOnly: false, ignoreProtocol: true};
    const options = Object.assign({}, defaultOptions, _options || {});

    // exit early and avoid parsing if the content does not contain the siteUrl or configured asset bases
    options.earlyExitMatchStr = buildEarlyExitMatch(siteUrl, options);

    // need to ignore itemPath because absoluteToRelative doesn't take that option
    const transformFunction = function (_url, _siteUrl, _itemPath, __options) {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return htmlTransform(html, siteUrl, transformFunction, '', options);
};

module.exports = htmlAbsoluteToTransformReady;
