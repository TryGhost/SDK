import type {LexicalTransformOptionsInput} from './types';
import absoluteToRelative, {type AbsoluteToRelativeOptionsInput} from './absolute-to-relative';
import lexicalTransform from './lexical-transform';

function lexicalAbsoluteToRelative(
    serializedLexical: string,
    siteUrl: string,
    _options: LexicalTransformOptionsInput = {}
): string {
    const defaultOptions: LexicalTransformOptionsInput = {assetsOnly: false, secure: false, nodes: [], transformMap: {}};
    const overrideOptions: LexicalTransformOptionsInput = {siteUrl, transformType: 'absoluteToRelative'};
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options: AbsoluteToRelativeOptionsInput): string {
        return absoluteToRelative(_url, _siteUrl, __options);
    };

    return lexicalTransform(serializedLexical, siteUrl, transformFunction, '', options);
}

export default lexicalAbsoluteToRelative;
