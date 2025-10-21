import absoluteToTransformReady, {type AbsoluteToTransformReadyOptionsInput} from './absolute-to-transform-ready';
import lexicalTransform from './lexical-transform';
import type {LexicalTransformOptionsInput} from './types';

export type LexicalAbsoluteToTransformReadyOptions = LexicalTransformOptionsInput & AbsoluteToTransformReadyOptionsInput;

function lexicalAbsoluteToTransformReady(
    serializedLexical: string,
    siteUrl: string,
    _options: LexicalAbsoluteToTransformReadyOptions = {}
): string {
    const overrideOptions: LexicalAbsoluteToTransformReadyOptions = {
        siteUrl,
        transformType: 'toTransformReady'
    };
    const options: LexicalAbsoluteToTransformReadyOptions = {
        assetsOnly: false,
        secure: false,
        nodes: [],
        transformMap: {},
        ..._options,
        ...overrideOptions
    };

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options?: AbsoluteToTransformReadyOptionsInput): string {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return lexicalTransform(serializedLexical, siteUrl, transformFunction, null, options);
}

export default lexicalAbsoluteToTransformReady;
