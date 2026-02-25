import type {MarkdownTransformOptionsInput} from './types';
import type {AbsoluteToRelativeOptionsInput} from './absolute-to-relative';
import markdownTransform from './markdown-transform';
import absoluteToRelative from './absolute-to-relative';
import htmlAbsoluteToRelative from './html-absolute-to-relative';

function markdownAbsoluteToRelative(
    markdown: string = '',
    siteUrl: string,
    _options: AbsoluteToRelativeOptionsInput = {}
): string {
    const defaultOptions: AbsoluteToRelativeOptionsInput = {assetsOnly: false, ignoreProtocol: true};
    const options: MarkdownTransformOptionsInput = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToRelative functions doen't take that option
    const transformFunctions = {
        html(_url: string, _siteUrl: string, _itemPath: string | null, __options: AbsoluteToRelativeOptionsInput): string {
            return htmlAbsoluteToRelative(_url, _siteUrl, __options);
        },
        url(_url: string, _siteUrl: string, _itemPath: string | null, __options: AbsoluteToRelativeOptionsInput): string {
            return absoluteToRelative(_url, _siteUrl, __options);
        }
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, '', options);
}

export default markdownAbsoluteToRelative;
