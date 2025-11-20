import type {LexicalTransformOptionsInput} from './types';
import lexicalRelativeToAbsolute from './lexical-relative-to-absolute';
import lexicalAbsoluteToTransformReady from './lexical-absolute-to-transform-ready';

function lexicalToTransformReady(
    lexical: string,
    siteUrl: string,
    itemPath: string | null | LexicalTransformOptionsInput,
    options?: LexicalTransformOptionsInput
): string {
    let finalItemPath: string | null = null;
    let finalOptions: LexicalTransformOptionsInput = options || {};

    if (typeof itemPath === 'object' && itemPath !== null && !options) {
        finalOptions = itemPath;
        finalItemPath = null;
    } else if (typeof itemPath === 'string') {
        finalItemPath = itemPath;
    }
    const absolute = lexicalRelativeToAbsolute(lexical, siteUrl, finalItemPath, finalOptions);
    return lexicalAbsoluteToTransformReady(absolute, siteUrl, finalOptions);
}

export default lexicalToTransformReady;
