import markdownRelativeToAbsolute from './markdown-relative-to-absolute';
import markdownAbsoluteToTransformReady from './markdown-absolute-to-transform-ready';

interface MarkdownToTransformReadyOptions {
    assetsOnly?: boolean;
    ignoreProtocol?: boolean;
    staticImageUrlPrefix?: string;
}

function markdownToTransformReady(
    markdown: string,
    siteUrl: string,
    itemPath?: string | MarkdownToTransformReadyOptions | null,
    options?: MarkdownToTransformReadyOptions
): string {
    let actualItemPath: string | null = null;
    let actualOptions: MarkdownToTransformReadyOptions;
    
    if (itemPath && typeof itemPath === 'object' && !options) {
        actualOptions = itemPath;
        actualItemPath = null;
    } else {
        actualOptions = options || {};
        actualItemPath = typeof itemPath === 'string' ? itemPath : null;
    }
    const absolute = markdownRelativeToAbsolute(markdown, siteUrl, actualItemPath || '', actualOptions);
    return markdownAbsoluteToTransformReady(absolute, siteUrl, actualOptions);
}

export default markdownToTransformReady;
