const relativeToAbsolute = require('./relative-to-absolute');
const lexicalTransform = require('./lexical-transform');

function lexicalRelativeToAbsolute(serializedLexical, siteUrl, itemPath, _options = {}) {
    const defaultOptions = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const overrideOptions = {siteUrl, itemPath, transformType: 'relativeToAbsolute'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return lexicalTransform(serializedLexical, siteUrl, relativeToAbsolute, itemPath, options);
}

module.exports = lexicalRelativeToAbsolute;
