import lexicalAbsoluteToTransformReady, {type LexicalAbsoluteToTransformReadyOptions} from './lexical-absolute-to-transform-ready';
import lexicalRelativeToAbsolute, {type LexicalRelativeToAbsoluteOptions} from './lexical-relative-to-absolute';

export type LexicalToTransformReadyOptions = LexicalRelativeToAbsoluteOptions & LexicalAbsoluteToTransformReadyOptions;

function lexicalToTransformReady(
    lexical: string,
    siteUrl: string,
    itemPath?: string | LexicalToTransformReadyOptions | null,
    options?: LexicalToTransformReadyOptions
): string {
    let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
    let resolvedOptions: LexicalToTransformReadyOptions | undefined = options;

    if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
        resolvedOptions = itemPath;
    }

    const absolute = lexicalRelativeToAbsolute(lexical, siteUrl, resolvedItemPath, resolvedOptions);
    return lexicalAbsoluteToTransformReady(absolute, siteUrl, resolvedOptions);
}

export default lexicalToTransformReady;
