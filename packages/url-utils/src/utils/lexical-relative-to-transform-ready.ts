import type {LexicalTransformOptionsInput} from './types';
import relativeToTransformReady from './relative-to-transform-ready';
import lexicalTransform from './lexical-transform';

function lexicalRelativeToTransformReady(
    serializedLexical: string,
    siteUrl: string,
    itemPath: string | null,
    _options: LexicalTransformOptionsInput = {}
): string {
    const defaultOptions: LexicalTransformOptionsInput = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const overrideOptions: LexicalTransformOptionsInput = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    return lexicalTransform(serializedLexical, siteUrl, relativeToTransformReady, itemPath, options);
}

export default lexicalRelativeToTransformReady;
