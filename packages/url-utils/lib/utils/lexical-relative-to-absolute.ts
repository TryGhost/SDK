import relativeToAbsolute from './relative-to-absolute';
import lexicalTransform = require('./lexical-transform');

interface LexicalRelativeToAbsoluteOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    nodes?: any[];
    transformMap?: Record<string, Record<string, (value: string) => string>>;
}

function lexicalRelativeToAbsolute(serializedLexical: string, siteUrl: string, itemPath: string | null, _options: LexicalRelativeToAbsoluteOptions = {}): string {
    const defaultOptions: LexicalRelativeToAbsoluteOptions = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const overrideOptions = {siteUrl, itemPath, transformType: 'relativeToAbsolute'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return lexicalTransform(serializedLexical, siteUrl, relativeToAbsolute, itemPath, options);
}

export = lexicalRelativeToAbsolute;
