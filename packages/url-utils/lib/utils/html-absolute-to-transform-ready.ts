import htmlTransform = require('./html-transform');
import absoluteToTransformReady from './absolute-to-transform-ready';

export interface HtmlAbsoluteToTransformReadyOptions {
    assetsOnly?: boolean;
    ignoreProtocol?: boolean;
    staticImageUrlPrefix?: string;
    earlyExitMatchStr?: string;
}

export const htmlAbsoluteToTransformReady = function (html = '', siteUrl: string, _options?: HtmlAbsoluteToTransformReadyOptions): string {
    const defaultOptions: HtmlAbsoluteToTransformReadyOptions = {assetsOnly: false, ignoreProtocol: true};
    const options = Object.assign({}, defaultOptions, _options || {});

    // exit early and avoid parsing if the content does not contain the siteUrl
    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToRelative doesn't take that option
    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options: any) {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return htmlTransform(html, siteUrl, transformFunction, '', options);
};

export default htmlAbsoluteToTransformReady;
