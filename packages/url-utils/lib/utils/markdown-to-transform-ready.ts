import markdownRelativeToAbsolute = require('./markdown-relative-to-absolute');
import markdownAbsoluteToTransformReady = require('./markdown-absolute-to-transform-ready');

interface MarkdownToTransformReadyOptions {
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
}

function markdownToTransformReady(markdown: string, siteUrl: string, itemPath?: string | MarkdownToTransformReadyOptions | null, options?: MarkdownToTransformReadyOptions): string {
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = null;
    }
    const absolute = markdownRelativeToAbsolute(markdown, siteUrl, itemPath || null, options);
    return markdownAbsoluteToTransformReady(absolute, siteUrl, options);
}

export = markdownToTransformReady;
