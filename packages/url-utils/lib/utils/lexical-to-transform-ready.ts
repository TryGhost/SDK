import lexicalRelativeToAbsolute = require('./lexical-relative-to-absolute');
import lexicalAbsoluteToTransformReady = require('./lexical-absolute-to-transform-ready');

interface LexicalToTransformReadyOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    nodes?: any[];
    transformMap?: Record<string, Record<string, (value: string) => string>>;
}

function lexicalToTransformReady(lexical: string, siteUrl: string, itemPath?: string | LexicalToTransformReadyOptions | null, options?: LexicalToTransformReadyOptions): string {
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = null;
    }
    const absolute = lexicalRelativeToAbsolute(lexical, siteUrl, itemPath as string | null, options);
    return lexicalAbsoluteToTransformReady(absolute, siteUrl, options);
}

export = lexicalToTransformReady;
