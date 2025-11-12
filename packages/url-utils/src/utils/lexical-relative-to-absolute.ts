import relativeToAbsolute from './relative-to-absolute';
import lexicalTransform from './lexical-transform';

interface LexicalRelativeToAbsoluteOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    nodes?: any[];
    transformMap?: Record<string, Record<string, (value: string) => string>>;
}

function lexicalRelativeToAbsolute(serializedLexical: string, siteUrl: string, itemPath: string, _options: LexicalRelativeToAbsoluteOptions = {}): string {
    const defaultOptions: Required<Pick<LexicalRelativeToAbsoluteOptions, 'assetsOnly' | 'secure' | 'nodes' | 'transformMap'>> = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const overrideOptions = {siteUrl, itemPath, transformType: 'relativeToAbsolute'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return lexicalTransform(serializedLexical, siteUrl, relativeToAbsolute, itemPath, options);
}

export default lexicalRelativeToAbsolute;
