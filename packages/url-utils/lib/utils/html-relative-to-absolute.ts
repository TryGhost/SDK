import htmlTransform = require('./html-transform');
import relativeToAbsolute from './relative-to-absolute';

interface HtmlRelativeToAbsoluteOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    staticImageUrlPrefix?: string;
    earlyExitMatchStr?: string;
}

function htmlRelativeToAbsolute(html = '', siteUrl: string, itemPath: string | HtmlRelativeToAbsoluteOptions | null, _options?: HtmlRelativeToAbsoluteOptions): string {
    const defaultOptions: HtmlRelativeToAbsoluteOptions = {assetsOnly: false, secure: false};
    const options = Object.assign({}, defaultOptions, _options || {});

    // exit early and avoid parsing if the content does not contain an attribute we might transform
    options.earlyExitMatchStr = 'href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    return htmlTransform(html, siteUrl, relativeToAbsolute, itemPath as string | null, options);
}

export = htmlRelativeToAbsolute;
