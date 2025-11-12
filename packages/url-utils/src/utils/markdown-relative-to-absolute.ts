import markdownTransform from './markdown-transform';
import htmlRelativeToAbsolute from './html-relative-to-absolute';
import relativeToAbsolute from './relative-to-absolute';

interface MarkdownRelativeToAbsoluteOptions {
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
    earlyExitMatchStr?: string;
}

function markdownRelativeToAbsolute(markdown: string = '', siteUrl: string, itemPath?: string, _options: MarkdownRelativeToAbsoluteOptions = {}): string {
    const defaultOptions: Required<Pick<MarkdownRelativeToAbsoluteOptions, 'assetsOnly'>> = {assetsOnly: false};
    const markdownOptions = Object.assign({}, defaultOptions, _options);

    markdownOptions.earlyExitMatchStr = '\\]\\([^\\s\\)]|href=|src=|srcset=';
    if (markdownOptions.assetsOnly) {
        markdownOptions.earlyExitMatchStr = markdownOptions.staticImageUrlPrefix;
    }

    const transformFunctions = {
        html: htmlRelativeToAbsolute,
        url: relativeToAbsolute
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, itemPath || '', markdownOptions);
}

export default markdownRelativeToAbsolute;
module.exports = markdownRelativeToAbsolute;
