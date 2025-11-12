import htmlTransform from './html-transform';
import absoluteToTransformReady from './absolute-to-transform-ready';

interface HtmlAbsoluteToTransformReadyOptions {
    assetsOnly?: boolean;
    ignoreProtocol?: boolean;
    earlyExitMatchStr?: string;
}

const htmlAbsoluteToTransformReady = function (html: string = '', siteUrl: string, _options: HtmlAbsoluteToTransformReadyOptions = {}): string {
    const defaultOptions: Required<Pick<HtmlAbsoluteToTransformReadyOptions, 'assetsOnly' | 'ignoreProtocol'>> = {assetsOnly: false, ignoreProtocol: true};
    const options = Object.assign({}, defaultOptions, _options || {});

    // exit early and avoid parsing if the content does not contain the siteUrl
    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToRelative doesn't take that option
    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string, __options: any): string {
        return absoluteToTransformReady(_url, _siteUrl, __options);
    };

    return htmlTransform(html, siteUrl, transformFunction, '', options);
};

export default htmlAbsoluteToTransformReady;
module.exports = htmlAbsoluteToTransformReady;
