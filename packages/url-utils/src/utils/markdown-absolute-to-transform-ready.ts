import absoluteToTransformReady, {type AbsoluteToTransformReadyOptionsInput} from './absolute-to-transform-ready';
import htmlAbsoluteToTransformReady from './html-absolute-to-transform-ready';
import markdownTransformDefault from './markdown-transform';
import type {MarkdownTransformOptions, MarkdownTransformOptionsInput} from './types';

const markdownTransform = markdownTransformDefault;

export type MarkdownAbsoluteToTransformReadyOptions = MarkdownTransformOptions;
export type MarkdownAbsoluteToTransformReadyOptionsInput = MarkdownTransformOptionsInput & AbsoluteToTransformReadyOptionsInput;

function markdownAbsoluteToTransformReady(markdown: string = '', siteUrl: string, _options: MarkdownAbsoluteToTransformReadyOptionsInput = {}): string {
    const options: MarkdownAbsoluteToTransformReadyOptions = {
        assetsOnly: false,
        ignoreProtocol: true,
        ..._options
    };

    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToTransformReady functions don't take that option
    const transformFunctions = {
        html(_url: string, _siteUrl: string, _itemPath: string | null, __options?: AbsoluteToTransformReadyOptionsInput) {
            return htmlAbsoluteToTransformReady(_url, _siteUrl, __options);
        },
        url(_url: string, _siteUrl: string, _itemPath: string | null, __options?: AbsoluteToTransformReadyOptionsInput) {
            return absoluteToTransformReady(_url, _siteUrl, __options);
        }
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, '', options);
}

export default markdownAbsoluteToTransformReady;
