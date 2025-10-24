import markdownAbsoluteToTransformReady, {type MarkdownAbsoluteToTransformReadyOptionsInput} from './markdown-absolute-to-transform-ready';
import markdownRelativeToAbsolute, {type MarkdownRelativeToAbsoluteOptionsInput} from './markdown-relative-to-absolute';

export type MarkdownToTransformReadyOptions = MarkdownRelativeToAbsoluteOptionsInput & MarkdownAbsoluteToTransformReadyOptionsInput;

function markdownToTransformReady(
    markdown: string,
    siteUrl: string,
    itemPath?: string | MarkdownToTransformReadyOptions | null,
    options?: MarkdownToTransformReadyOptions
): string {
    let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
    let resolvedOptions: MarkdownToTransformReadyOptions | undefined = options;

    if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
        resolvedOptions = itemPath;
    }

    const absolute = markdownRelativeToAbsolute(markdown, siteUrl, resolvedItemPath, resolvedOptions);
    return markdownAbsoluteToTransformReady(absolute, siteUrl, resolvedOptions);
}

export default markdownToTransformReady;
