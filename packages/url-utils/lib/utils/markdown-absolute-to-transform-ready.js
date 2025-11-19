const markdownTransform = require('./markdown-transform');
const absoluteToTransformReady = require('./absolute-to-transform-ready');
const htmlAbsoluteToTransformReady = require('./html-absolute-to-transform-ready');

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
