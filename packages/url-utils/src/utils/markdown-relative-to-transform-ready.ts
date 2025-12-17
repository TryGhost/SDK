import type {MarkdownTransformOptionsInput, SecureOptionsInput} from './types';
import markdownTransform from './markdown-transform';
import htmlRelativeToTransformReady from './html-relative-to-transform-ready';
import relativeToTransformReady from './relative-to-transform-ready';

function markdownRelativeToTransformReady(
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
        html: htmlRelativeToTransformReady,
        url: relativeToTransformReady
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, itemPath, options);
}

export default markdownRelativeToTransformReady;
