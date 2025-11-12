import markdownTransform from './markdown-transform';
import absoluteToRelative from './absolute-to-relative';
import htmlAbsoluteToRelative from './html-absolute-to-relative';

interface MarkdownAbsoluteToRelativeOptions {
    assetsOnly?: boolean;
    ignoreProtocol?: boolean;
    earlyExitMatchStr?: string;
}

function markdownAbsoluteToRelative(markdown: string = '', siteUrl: string, _options: MarkdownAbsoluteToRelativeOptions = {}): string {
    const defaultOptions: Required<Pick<MarkdownAbsoluteToRelativeOptions, 'assetsOnly' | 'ignoreProtocol'>> = {assetsOnly: false, ignoreProtocol: true};
    const options = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToRelative functions doen't take that option
    const transformFunctions = {
        html(_url: string, _siteUrl: string, _itemPath: string, __options: any): string {
            return htmlAbsoluteToRelative(_url, _siteUrl, __options);
        },
        url(_url: string, _siteUrl: string, _itemPath: string, __options: any): string {
            return absoluteToRelative(_url, _siteUrl, __options);
        }
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, '', options);
}

export default markdownAbsoluteToRelative;
module.exports = markdownAbsoluteToRelative;
