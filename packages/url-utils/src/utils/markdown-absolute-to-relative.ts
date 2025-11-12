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
    const markdownOptions = Object.assign({}, defaultOptions, _options);

    markdownOptions.earlyExitMatchStr = markdownOptions.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    markdownOptions.earlyExitMatchStr = markdownOptions.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToRelative functions doen't take that option
    const transformFunctions = {
        html(_url: string, _siteUrl: string, _itemPath: string, htmlOpts: any): string {
            return htmlAbsoluteToRelative(_url, _siteUrl, htmlOpts);
        },
        url(_url: string, _siteUrl: string, _itemPath: string, urlOpts: any): string {
            return absoluteToRelative(_url, _siteUrl, urlOpts);
        }
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, '', markdownOptions);
}

export default markdownAbsoluteToRelative;
module.exports = markdownAbsoluteToRelative;
