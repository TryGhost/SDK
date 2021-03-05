const relativeToTransformReady = require('./relative-to-transform-ready');
const mobiledocTransform = require('./_mobiledoc-transform');

function mobiledocRelativeToTransformReady(serializedMobiledoc, siteUrl, itemPath, _options = {}) {
    const defaultOptions = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return mobiledocTransform(serializedMobiledoc, siteUrl, relativeToTransformReady, itemPath, options);
}

module.exports = mobiledocRelativeToTransformReady;
