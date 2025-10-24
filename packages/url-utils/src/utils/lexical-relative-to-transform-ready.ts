import lexicalTransform from './lexical-transform';
import relativeToTransformReady, {type RelativeToTransformReadyOptionsInput} from './relative-to-transform-ready';
import type {LexicalTransformOptionsInput} from './types';

export type LexicalRelativeToTransformReadyOptions = LexicalTransformOptionsInput & RelativeToTransformReadyOptionsInput;

function lexicalRelativeToTransformReady(
    serializedLexical: string,
    siteUrl: string,
    itemPath: string | null,
    _options: LexicalRelativeToTransformReadyOptions = {}
): string {
    const overrideOptions: LexicalRelativeToTransformReadyOptions = {
        siteUrl,
        transformType: 'toTransformReady'
    };
    const options: LexicalRelativeToTransformReadyOptions = {
        assetsOnly: false,
        secure: false,
        nodes: [],
        transformMap: {},
        ..._options,
        ...overrideOptions
    };

    return lexicalTransform(serializedLexical, siteUrl, relativeToTransformReady, itemPath, options);
}

export default lexicalRelativeToTransformReady;
