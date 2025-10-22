import markdownTransform = require('./markdown-transform');
import htmlRelativeToAbsolute = require('./html-relative-to-absolute');
import relativeToAbsolute from './relative-to-absolute';

interface MarkdownRelativeToAbsoluteOptions {
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
    earlyExitMatchStr?: string;
}

function markdownRelativeToAbsolute(markdown = '', siteUrl: string, itemPath: string | MarkdownRelativeToAbsoluteOptions | null, _options: MarkdownRelativeToAbsoluteOptions = {}): string {
    const defaultOptions: MarkdownRelativeToAbsoluteOptions = {assetsOnly: false};
    const options = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = '\\]\\([^\\s\\)]|href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    const transformFunctions = {
        html: htmlRelativeToAbsolute,
        url: relativeToAbsolute
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, itemPath as string | null, options);
}

export = markdownRelativeToAbsolute;
