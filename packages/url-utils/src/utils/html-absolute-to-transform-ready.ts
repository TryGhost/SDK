import absoluteToTransformReady, {type AbsoluteToTransformReadyOptionsInput} from './absolute-to-transform-ready';
import htmlTransform from './html-transform';
import type {HtmlTransformOptions, HtmlTransformOptionsInput} from './types';

export interface HtmlAbsoluteToTransformReadyOptions extends HtmlTransformOptions {
    ignoreProtocol: boolean;
}

export type HtmlAbsoluteToTransformReadyOptionsInput = HtmlTransformOptionsInput & AbsoluteToTransformReadyOptionsInput & Partial<Pick<HtmlAbsoluteToTransformReadyOptions, 'ignoreProtocol'>>;

const htmlAbsoluteToTransformReady = function (html: string = '', siteUrl: string, _options?: HtmlAbsoluteToTransformReadyOptionsInput): string {
    const defaultOptions: HtmlAbsoluteToTransformReadyOptions = {assetsOnly: false, secure: false, ignoreProtocol: true};
    const options: HtmlAbsoluteToTransformReadyOptions = {
        ...defaultOptions,
        ..._options
    };

    // exit early and avoid parsing if the content does not contain the siteUrl
    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToTransformReady doesn't take that option
    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options?: AbsoluteToTransformReadyOptionsInput): string {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return htmlTransform(html, siteUrl, transformFunction, '', options);
};

export default htmlAbsoluteToTransformReady;
