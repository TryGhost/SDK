import type {HtmlTransformOptionsInput} from './types';
import type {AbsoluteToRelativeOptionsInput} from './absolute-to-relative';
import htmlTransform from './html-transform';
import absoluteToRelative from './absolute-to-relative';

function htmlAbsoluteToRelative(
    html: string = '',
    siteUrl: string,
    _options: AbsoluteToRelativeOptionsInput = {}
): string {
    const defaultOptions: AbsoluteToRelativeOptionsInput = {assetsOnly: false, ignoreProtocol: true};
    const options: HtmlTransformOptionsInput = Object.assign({}, defaultOptions, _options || {});

    // exit early and avoid parsing if the content does not contain the siteUrl
    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToRelative doesn't take that option
    const transformFunction = function (_url: string, _siteUrl: string, _itemPath: string | null, __options: AbsoluteToRelativeOptionsInput): string {
        return absoluteToRelative(_url, _siteUrl, __options);
    };

    return htmlTransform(html, siteUrl, transformFunction, '', options);
}

export default htmlAbsoluteToRelative;
