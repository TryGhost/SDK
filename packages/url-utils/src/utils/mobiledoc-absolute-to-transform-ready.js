const absoluteToTransformReady = require('./absolute-to-transform-ready');
const mobiledocTransform = require('./mobiledoc-transform');

function mobiledocAbsoluteToRelative(serializedMobiledoc, siteUrl, _options = {}) {
    const defaultOptions = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    const transformFunction = function (_url, _siteUrl, _itemPath, __options) {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return mobiledocTransform(serializedMobiledoc, siteUrl, transformFunction, '', options);
}

module.exports = mobiledocAbsoluteToRelative;
