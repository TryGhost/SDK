import htmlRelativeToAbsolute from './html-relative-to-absolute';
import htmlAbsoluteToTransformReady from './html-absolute-to-transform-ready';

interface HtmlToTransformReadyOptions {
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
    replacementStr?: string;
}

function htmlToTransformReady(html: string, siteUrl: string, itemPath?: string | HtmlToTransformReadyOptions | null, options?: HtmlToTransformReadyOptions): string {
    let actualItemPath: string | null | undefined = itemPath as string | null | undefined;
    if (typeof itemPath === 'object' && !options) {
        options = itemPath as HtmlToTransformReadyOptions;
        actualItemPath = null;
    }
    const absolute = htmlRelativeToAbsolute(html, siteUrl, actualItemPath || null, options);
    return htmlAbsoluteToTransformReady(absolute, siteUrl, options);
}

export default htmlToTransformReady;
