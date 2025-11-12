import markdownTransform from './markdown-transform';
import htmlRelativeToTransformReady from './html-relative-to-transform-ready';
import relativeToTransformReady from './relative-to-transform-ready';

interface MarkdownRelativeToTransformReadyOptions {
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
    earlyExitMatchStr?: string;
}

function markdownRelativeToTransformReady(markdown: string = '', siteUrl: string, itemPath: string, _options: MarkdownRelativeToTransformReadyOptions = {}): string {
    const defaultOptions: Required<Pick<MarkdownRelativeToTransformReadyOptions, 'assetsOnly'>> = {assetsOnly: false};
    const options = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = '\\]\\([^\\s\\)]|href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    const transformFunctions = {
        html: (html: string, _siteUrl: string, _itemPath: string, _options: any): string => {
            return htmlRelativeToTransformReady(html, siteUrl, itemPath, options);
        },
        url: (url: string, _siteUrl: string, _itemPath: string, _options: any): string => {
            return relativeToTransformReady(url, siteUrl, itemPath, options);
        }
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, itemPath, options);
}

export default markdownRelativeToTransformReady;
