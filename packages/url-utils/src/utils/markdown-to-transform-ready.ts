import type {MarkdownTransformOptionsInput} from './types';
import markdownRelativeToAbsolute from './markdown-relative-to-absolute';
import markdownAbsoluteToTransformReady from './markdown-absolute-to-transform-ready';

function markdownToTransformReady(
    markdown: string,
    siteUrl: string,
    itemPath: string | null | MarkdownTransformOptionsInput,
    options?: MarkdownTransformOptionsInput
): string {
    let finalItemPath: string | null = null;
    let finalOptions: MarkdownTransformOptionsInput = options || {};

    if (typeof itemPath === 'object' && itemPath !== null && !options) {
        finalOptions = itemPath;
        finalItemPath = null;
    } else if (typeof itemPath === 'string') {
        finalItemPath = itemPath;
    }

    const absolute = markdownRelativeToAbsolute(markdown, siteUrl, finalItemPath, finalOptions);
    return markdownAbsoluteToTransformReady(absolute, siteUrl, finalOptions);
}

export default markdownToTransformReady;
