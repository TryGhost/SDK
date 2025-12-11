import type {LexicalTransformOptionsInput} from './types';
import relativeToAbsolute from './relative-to-absolute';
import lexicalTransform from './lexical-transform';

function lexicalRelativeToAbsolute(
    serializedLexical: string,
    siteUrl: string,
    itemPath: string | null,
    _options: LexicalTransformOptionsInput = {}
): string {
    const defaultOptions: LexicalTransformOptionsInput = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const overrideOptions: LexicalTransformOptionsInput = {siteUrl, itemPath, transformType: 'relativeToAbsolute'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return lexicalTransform(serializedLexical, siteUrl, relativeToAbsolute, itemPath, options);
}

export default lexicalRelativeToAbsolute;
