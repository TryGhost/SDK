const absoluteToTransformReady = require('./absolute-to-transform-ready');
const lexicalTransform = require('./lexical-transform');

function lexicalAbsoluteToRelative(serializedLexical, siteUrl, _options = {}) {
    const defaultOptions = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const overrideOptions = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    const transformFunction = function (_url, _siteUrl, _itemPath, __options) {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return lexicalTransform(serializedLexical, siteUrl, transformFunction, '', options);
}

module.exports = lexicalAbsoluteToRelative;
