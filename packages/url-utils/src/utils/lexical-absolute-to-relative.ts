import absoluteToRelative, {type AbsoluteToRelativeOptionsInput} from './absolute-to-relative';
import lexicalTransform from './lexical-transform';
import type {LexicalTransformOptionsInput} from './types';

export type LexicalAbsoluteToRelativeOptions = LexicalTransformOptionsInput & AbsoluteToRelativeOptionsInput;

function lexicalAbsoluteToRelative(
    serializedLexical: string,
    siteUrl: string,
    _options: LexicalAbsoluteToRelativeOptions = {}
): string {
    const overrideOptions: LexicalAbsoluteToRelativeOptions = {
        siteUrl,
        transformType: 'absoluteToRelative'
    };
    const options: LexicalAbsoluteToRelativeOptions = {
        assetsOnly: false,
        secure: false,
        nodes: [],
        transformMap: {},
        ..._options,
        ...overrideOptions
    };

    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options?: AbsoluteToRelativeOptionsInput): string {
        return absoluteToRelative(_url, _siteUrl, __options);
    };

    return lexicalTransform(serializedLexical, siteUrl, transformFunction, null, options);
}

export default lexicalAbsoluteToRelative;
