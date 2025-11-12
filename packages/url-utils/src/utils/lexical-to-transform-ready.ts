import lexicalRelativeToAbsolute from './lexical-relative-to-absolute';
import lexicalAbsoluteToTransformReady from './lexical-absolute-to-transform-ready';

interface LexicalToTransformReadyOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    nodes?: any[];
    transformMap?: Record<string, Record<string, (value: string) => string>>;
}

function lexicalToTransformReady(
    lexical: string,
    siteUrl: string,
    itemPath?: string | LexicalToTransformReadyOptions | null,
    options?: LexicalToTransformReadyOptions
): string {
    let actualItemPath: string | null = null;
    let actualOptions: LexicalToTransformReadyOptions;
    
    if (itemPath && typeof itemPath === 'object' && !options) {
        actualOptions = itemPath;
        actualItemPath = null;
    } else {
        actualOptions = options || {};
        actualItemPath = typeof itemPath === 'string' ? itemPath : null;
    }
    const absolute = lexicalRelativeToAbsolute(lexical, siteUrl, actualItemPath || '', actualOptions);
    return lexicalAbsoluteToTransformReady(absolute, siteUrl, actualOptions);
}

export default lexicalToTransformReady;
