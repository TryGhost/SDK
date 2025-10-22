import markdownTransform = require('./markdown-transform');
import absoluteToRelative from './absolute-to-relative';
import htmlAbsoluteToRelative = require('./html-absolute-to-relative');

interface MarkdownAbsoluteToRelativeOptions {
    assetsOnly?: boolean;
    ignoreProtocol?: boolean;
    staticImageUrlPrefix?: string;
    earlyExitMatchStr?: string;
}

function markdownAbsoluteToRelative(markdown = '', siteUrl: string, _options: MarkdownAbsoluteToRelativeOptions = {}): string {
    const defaultOptions: MarkdownAbsoluteToRelativeOptions = {assetsOnly: false, ignoreProtocol: true};
    const options = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = options.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    options.earlyExitMatchStr = options.earlyExitMatchStr.replace(/\/$/, '');

    // need to ignore itemPath because absoluteToRelative functions doen't take that option
    const transformFunctions = {
        html(_url: string, _siteUrl: string, _itemPath: string | null, __options: any) {
            return htmlAbsoluteToRelative(_url, _siteUrl, __options);
        },
        url(_url: string, _siteUrl: string, _itemPath: string | null, __options: any) {
            return absoluteToRelative(_url, _siteUrl, __options);
        }
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, '', options);
}

export = markdownAbsoluteToRelative;
