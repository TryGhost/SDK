import type {MarkdownTransformOptionsInput} from './types';
import type {SecureOptionsInput} from './types';
import markdownTransform from './markdown-transform';
import htmlRelativeToAbsolute from './html-relative-to-absolute';
import relativeToAbsolute from './relative-to-absolute';

function markdownRelativeToAbsolute(
    markdown: string = '',
    siteUrl: string,
    itemPath: string | null,
    _options: SecureOptionsInput = {}
): string {
    const defaultOptions: SecureOptionsInput = {assetsOnly: false};
    const options: MarkdownTransformOptionsInput = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = '\\]\\([^\\s\\)]|href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    const transformFunctions = {
        html: htmlRelativeToAbsolute,
        url: relativeToAbsolute
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, itemPath, options);
}

export default markdownRelativeToAbsolute;
