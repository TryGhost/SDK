import htmlRelativeToAbsolute from './html-relative-to-absolute';
import htmlAbsoluteToTransformReady from './html-absolute-to-transform-ready';

interface HtmlToTransformReadyOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    ignoreProtocol?: boolean;
    staticImageUrlPrefix?: string;
}

function htmlToTransformReady(
    html: string,
    siteUrl: string,
    itemPath?: string | HtmlToTransformReadyOptions | null,
    options?: HtmlToTransformReadyOptions
): string {
    let actualItemPath: string | null = null;
    let actualOptions: HtmlToTransformReadyOptions;
    
    if (itemPath && typeof itemPath === 'object' && !options) {
        actualOptions = itemPath;
        actualItemPath = null;
    } else {
        actualOptions = options || {};
        actualItemPath = typeof itemPath === 'string' ? itemPath : null;
    }
    const absolute = htmlRelativeToAbsolute(html, siteUrl, actualItemPath || '', actualOptions);
    return htmlAbsoluteToTransformReady(absolute, siteUrl, actualOptions);
}

export default htmlToTransformReady;
