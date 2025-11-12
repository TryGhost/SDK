import markdownTransform from './markdown-transform';
import absoluteToTransformReady from './absolute-to-transform-ready';
import htmlAbsoluteToTransformReady from './html-absolute-to-transform-ready';

interface MarkdownAbsoluteToTransformReadyOptions {
    assetsOnly?: boolean;
    ignoreProtocol?: boolean;
    earlyExitMatchStr?: string;
}

function markdownAbsoluteToTransformReady(markdown: string = '', siteUrl: string, _options: MarkdownAbsoluteToTransformReadyOptions = {}): string {
    const defaultOptions: Required<Pick<MarkdownAbsoluteToTransformReadyOptions, 'assetsOnly' | 'ignoreProtocol'>> = {assetsOnly: false, ignoreProtocol: true};
    const options = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToTransformReady functions doen't take that option
    const transformFunctions = {
        html(_url: string, _siteUrl: string, _itemPath: string, __options: any): string {
            return htmlAbsoluteToTransformReady(_url, _siteUrl, __options);
        },
        url(_url: string, _siteUrl: string, _itemPath: string, __options: any): string {
            return absoluteToTransformReady(_url, _siteUrl, __options);
        }
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, '', options);
}

export default markdownAbsoluteToTransformReady;
