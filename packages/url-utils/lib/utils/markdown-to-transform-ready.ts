import markdownRelativeToAbsolute = require('./markdown-relative-to-absolute');
import markdownAbsoluteToTransformReady = require('./markdown-absolute-to-transform-ready');

interface MarkdownToTransformReadyOptions {
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
}

function markdownToTransformReady(markdown: string, siteUrl: string, itemPath?: string | MarkdownToTransformReadyOptions | null, options?: MarkdownToTransformReadyOptions): string {
    let actualItemPath: string | null | undefined = itemPath as string | null | undefined;
    if (typeof itemPath === 'object' && !options) {
        options = itemPath as MarkdownToTransformReadyOptions;
        actualItemPath = null;
    }
    const absolute = markdownRelativeToAbsolute(markdown, siteUrl, actualItemPath || null, options);
    return markdownAbsoluteToTransformReady(absolute, siteUrl, options);
}

export = markdownToTransformReady;
