import markdownTransform = require('./markdown-transform');
import absoluteToTransformReady = require('./absolute-to-transform-ready');
import htmlAbsoluteToTransformReady = require('./html-absolute-to-transform-ready');

interface MarkdownAbsoluteToTransformReadyOptions {
    assetsOnly?: boolean;
    ignoreProtocol?: boolean;
    staticImageUrlPrefix?: string;
    earlyExitMatchStr?: string;
}

function markdownAbsoluteToTransformReady(markdown = '', siteUrl: string, _options: MarkdownAbsoluteToTransformReadyOptions = {}): string {
    const defaultOptions: MarkdownAbsoluteToTransformReadyOptions = {assetsOnly: false, ignoreProtocol: true};
    const options = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToTransformReady functions doen't take that option
    const transformFunctions = {
        html(_url: string, _siteUrl: string, _itemPath: string | null, __options: any) {
            return htmlAbsoluteToTransformReady(_url, _siteUrl, __options);
        },
        url(_url: string, _siteUrl: string, _itemPath: string | null, __options: any) {
            return absoluteToTransformReady(_url, _siteUrl, __options);
        }
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, '', options);
}

export = markdownAbsoluteToTransformReady;
