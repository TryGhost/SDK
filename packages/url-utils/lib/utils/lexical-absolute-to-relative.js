const absoluteToRelative = require('./absolute-to-relative');
const lexicalTransform = require('./_lexical-transform');

function lexicalAbsoluteToRelative(serializedLexical, siteUrl, _options = {}) {
    const defaultOptions = {assetsOnly: false, secure: false, cardTransformers: []};
    const overrideOptions = {siteUrl, transformType: 'absoluteToRelative'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    const transformFunction = function (_url, _siteUrl, _itemPath, __options) {
        return absoluteToRelative(_url, _siteUrl, __options);
    };

    return lexicalTransform(serializedLexical, siteUrl, transformFunction, '', options);
}

module.exports = lexicalAbsoluteToRelative;
