import absoluteToRelative, {type AbsoluteToRelativeOptionsInput} from './absolute-to-relative';
import htmlTransform from './html-transform';
import type {HtmlTransformOptions, HtmlTransformOptionsInput} from './types';

export interface HtmlAbsoluteToRelativeOptions extends HtmlTransformOptions {
    ignoreProtocol: boolean;
}

export type HtmlAbsoluteToRelativeOptionsInput = HtmlTransformOptionsInput & AbsoluteToRelativeOptionsInput & Partial<Pick<HtmlAbsoluteToRelativeOptions, 'ignoreProtocol'>>;

function htmlAbsoluteToRelative(html: string = '', siteUrl: string, _options?: HtmlAbsoluteToRelativeOptionsInput): string {
    const defaultOptions: HtmlAbsoluteToRelativeOptions = {assetsOnly: false, secure: false, ignoreProtocol: true};
    const options: HtmlAbsoluteToRelativeOptions = {
        ...defaultOptions,
        ..._options
    };

    // exit early and avoid parsing if the content does not contain the siteUrl
    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToRelative doesn't take that option
    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options?: AbsoluteToRelativeOptionsInput): string {
        return absoluteToRelative(_url, _siteUrl, __options);
    };

    return htmlTransform(html, siteUrl, transformFunction, '', options);
}

export default htmlAbsoluteToRelative;
