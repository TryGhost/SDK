import htmlRelativeToTransformReady from './html-relative-to-transform-ready';
import markdownTransformDefault from './markdown-transform';
import relativeToTransformReady from './relative-to-transform-ready';
import type {MarkdownTransformOptions, MarkdownTransformOptionsInput} from './types';

const markdownTransform = markdownTransformDefault;

export type MarkdownRelativeToTransformReadyOptions = MarkdownTransformOptions;
export type MarkdownRelativeToTransformReadyOptionsInput = MarkdownTransformOptionsInput;

function markdownRelativeToTransformReady(
    markdown: string = '',
    siteUrl: string,
    itemPath?: string | MarkdownRelativeToTransformReadyOptionsInput | null,
    _options: MarkdownRelativeToTransformReadyOptionsInput = {}
): string {
    let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
    let resolvedOptions: MarkdownRelativeToTransformReadyOptionsInput = _options;

    if (typeof itemPath === 'object' && itemPath !== null) {
        resolvedOptions = itemPath;
        resolvedItemPath = null;
    }

    const options: MarkdownRelativeToTransformReadyOptions = {
        assetsOnly: false,
        ignoreProtocol: true,
        ...resolvedOptions
    };

    options.earlyExitMatchStr = '\\]\\([^\\s\\)]|href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix ?? 'content/images';
    }

    const transformFunctions = {
        html: htmlRelativeToTransformReady,
        url: relativeToTransformReady
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, resolvedItemPath, options);
}

export default markdownRelativeToTransformReady;
