const relativeToTransformReady = require('./relative-to-transform-ready');
const lexicalTransform = require('./lexical-transform');

function lexicalRelativeToTransformReady(serializedLexical, siteUrl, itemPath, _options = {}) {
    const defaultOptions = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const overrideOptions = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return lexicalTransform(serializedLexical, siteUrl, relativeToTransformReady, itemPath, options);
}

module.exports = lexicalRelativeToTransformReady;
