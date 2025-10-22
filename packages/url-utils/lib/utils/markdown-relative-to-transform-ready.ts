import markdownTransform = require('./markdown-transform');
import htmlRelativeToTransformReady from './html-relative-to-transform-ready';
import relativeToTransformReady from './relative-to-transform-ready';

interface MarkdownRelativeToTransformReadyOptions {
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
    earlyExitMatchStr?: string;
}

function markdownRelativeToTransformReady(markdown = '', siteUrl: string, itemPath: string | MarkdownRelativeToTransformReadyOptions | null, _options: MarkdownRelativeToTransformReadyOptions = {}): string {
    const defaultOptions: MarkdownRelativeToTransformReadyOptions = {assetsOnly: false};
    const options = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = '\\]\\([^\\s\\)]|href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    const transformFunctions = {
        html: htmlRelativeToTransformReady,
        url: relativeToTransformReady
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, itemPath as string | null, options);
}

export = markdownRelativeToTransformReady;
