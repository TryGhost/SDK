import absoluteToRelative, {type AbsoluteToRelativeOptionsInput} from './absolute-to-relative';
import htmlAbsoluteToRelative from './html-absolute-to-relative';
import markdownTransformDefault from './markdown-transform';
import type {MarkdownTransformOptions, MarkdownTransformOptionsInput} from './types';

const markdownTransform = markdownTransformDefault;

export type MarkdownAbsoluteToRelativeOptions = MarkdownTransformOptions;
export type MarkdownAbsoluteToRelativeOptionsInput = MarkdownTransformOptionsInput & AbsoluteToRelativeOptionsInput;

function markdownAbsoluteToRelative(markdown: string = '', siteUrl: string, _options: MarkdownAbsoluteToRelativeOptionsInput = {}): string {
    const options: MarkdownAbsoluteToRelativeOptions = {
        assetsOnly: false,
        ignoreProtocol: true,
        ..._options
    };

    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToRelative functions don't take that option
    const transformFunctions = {
        html(_url: string, _siteUrl: string, _itemPath: string | null, __options?: AbsoluteToRelativeOptionsInput) {
            return htmlAbsoluteToRelative(_url, _siteUrl, __options);
        },
        url(_url: string, _siteUrl: string, _itemPath: string | null, __options?: AbsoluteToRelativeOptionsInput) {
            return absoluteToRelative(_url, _siteUrl, __options);
        }
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, '', options);
}

export default markdownAbsoluteToRelative;
