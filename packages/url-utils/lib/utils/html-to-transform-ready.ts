import htmlRelativeToAbsolute = require('./html-relative-to-absolute');
import htmlAbsoluteToTransformReady = require('./html-absolute-to-transform-ready');

interface HtmlToTransformReadyOptions {
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
    replacementStr?: string;
}

function htmlToTransformReady(html: string, siteUrl: string, itemPath?: string | HtmlToTransformReadyOptions | null, options?: HtmlToTransformReadyOptions): string {
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = null;
    }
    const absolute = htmlRelativeToAbsolute(html, siteUrl, itemPath || null, options);
    return htmlAbsoluteToTransformReady(absolute, siteUrl, options);
}

export = htmlToTransformReady;
