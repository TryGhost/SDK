const relativeToAbsolute = require('./relative-to-absolute');
const mobiledocTransform = require('./_mobiledoc-transform');

function mobiledocRelativeToAbsolute(serializedMobiledoc, siteUrl, itemPath, _options = {}) {
    const defaultOptions = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions = {siteUrl, itemPath, transformType: 'relativeToAbsolute'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return mobiledocTransform(serializedMobiledoc, siteUrl, relativeToAbsolute, itemPath, options);
}

module.exports = mobiledocRelativeToAbsolute;
