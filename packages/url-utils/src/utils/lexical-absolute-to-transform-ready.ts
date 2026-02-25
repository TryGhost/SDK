import type {LexicalTransformOptionsInput, AbsoluteToTransformReadyOptionsInput} from './types';
import absoluteToTransformReady from './absolute-to-transform-ready';
import lexicalTransform from './lexical-transform';

function lexicalAbsoluteToTransformReady(
    serializedLexical: string,
    siteUrl: string,
    _options: LexicalTransformOptionsInput = {}
): string {
    const defaultOptions: LexicalTransformOptionsInput = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const overrideOptions: LexicalTransformOptionsInput = {siteUrl, transformType: 'toTransformReady'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options: AbsoluteToTransformReadyOptionsInput): string {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return lexicalTransform(serializedLexical, siteUrl, transformFunction, '', options);
}

export default lexicalAbsoluteToTransformReady;
