import type {MarkdownTransformOptionsInput, AbsoluteToTransformReadyOptionsInput} from './types';
import markdownTransform from './markdown-transform';
import absoluteToTransformReady from './absolute-to-transform-ready';
import htmlAbsoluteToTransformReady from './html-absolute-to-transform-ready';
import buildEarlyExitMatchModule from './build-early-exit-match';
const {buildEarlyExitMatch} = buildEarlyExitMatchModule;

function markdownAbsoluteToTransformReady(
    markdown: string = '',
    siteUrl: string,
    _options: AbsoluteToTransformReadyOptionsInput = {}
): string {
    const defaultOptions: AbsoluteToTransformReadyOptionsInput = {assetsOnly: false, ignoreProtocol: true};
    const options: MarkdownTransformOptionsInput = Object.assign({}, defaultOptions, _options);

    const earlyExitMatch = buildEarlyExitMatch(siteUrl, options);
    if (earlyExitMatch) {
        options.earlyExitMatchStr = earlyExitMatch;
    }

    // need to ignore itemPath because absoluteToTransformReady functions doen't take that option
    const transformFunctions = {
        html(_url: string, _siteUrl: string, _itemPath: string | null, __options: AbsoluteToTransformReadyOptionsInput): string {
            return htmlAbsoluteToTransformReady(_url, _siteUrl, __options);
        },
        url(_url: string, _siteUrl: string, _itemPath: string | null, __options: AbsoluteToTransformReadyOptionsInput): string {
            return absoluteToTransformReady(_url, _siteUrl, __options);
        }
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, '', options);
}

export default markdownAbsoluteToTransformReady;
