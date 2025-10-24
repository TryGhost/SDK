import htmlRelativeToAbsolute from './html-relative-to-absolute';
import markdownTransformDefault from './markdown-transform';
import relativeToAbsolute from './relative-to-absolute';
import type {MarkdownTransformOptions, MarkdownTransformOptionsInput} from './types';

const markdownTransform = markdownTransformDefault;

export type MarkdownRelativeToAbsoluteOptions = MarkdownTransformOptions;
export type MarkdownRelativeToAbsoluteOptionsInput = MarkdownTransformOptionsInput;

function markdownRelativeToAbsolute(
    markdown: string = '',
    siteUrl: string,
    itemPath?: string | MarkdownRelativeToAbsoluteOptionsInput | null,
    _options: MarkdownRelativeToAbsoluteOptionsInput = {}
): string {
    let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
    let resolvedOptions: MarkdownRelativeToAbsoluteOptionsInput = _options;

    if (typeof itemPath === 'object' && itemPath !== null) {
        resolvedOptions = itemPath;
        resolvedItemPath = null;
    }

    const options: MarkdownRelativeToAbsoluteOptions = {
        assetsOnly: false,
        ignoreProtocol: true,
        ...resolvedOptions
    };

    options.earlyExitMatchStr = '\\]\\([^\\s\\)]|href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix ?? 'content/images';
    }

    const transformFunctions = {
        html: htmlRelativeToAbsolute,
        url: relativeToAbsolute
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, resolvedItemPath, options);
}

export default markdownRelativeToAbsolute;
