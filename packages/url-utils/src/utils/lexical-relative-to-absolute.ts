import lexicalTransform from './lexical-transform';
import relativeToAbsolute, {type RelativeToAbsoluteOptionsInput} from './relative-to-absolute';
import type {LexicalTransformOptionsInput} from './types';

export type LexicalRelativeToAbsoluteOptions = LexicalTransformOptionsInput & RelativeToAbsoluteOptionsInput;

function lexicalRelativeToAbsolute(
    serializedLexical: string,
    siteUrl: string,
    itemPath: string | null,
    _options: LexicalRelativeToAbsoluteOptions = {}
): string {
    const overrideOptions: LexicalRelativeToAbsoluteOptions = {
        siteUrl,
        itemPath,
        transformType: 'relativeToAbsolute'
    };
    const options: LexicalRelativeToAbsoluteOptions = {
        assetsOnly: false,
        secure: false,
        nodes: [],
        transformMap: {},
        ..._options,
        ...overrideOptions
    };

    return lexicalTransform(serializedLexical, siteUrl, relativeToAbsolute, itemPath, options);
}

export default lexicalRelativeToAbsolute;
