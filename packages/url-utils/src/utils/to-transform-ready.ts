import relativeToAbsolute from './relative-to-absolute';
import absoluteToTransformReady from './absolute-to-transform-ready';

interface ToTransformReadyOptions {
    replacementStr?: string;
    withoutSubdirectory?: boolean;
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
    secure?: boolean;
}

function toTransformReady(
    url: string,
    siteUrl: string,
    itemPath?: string | ToTransformReadyOptions | null,
    options?: ToTransformReadyOptions
): string {
    let actualItemPath: string | null = null;
    let actualOptions: ToTransformReadyOptions;
    
    if (itemPath && typeof itemPath === 'object' && !options) {
        actualOptions = itemPath;
        actualItemPath = null;
    } else {
        actualOptions = options || {};
        actualItemPath = typeof itemPath === 'string' ? itemPath : null;
    }
    const absoluteUrl = relativeToAbsolute(url, siteUrl, actualItemPath, actualOptions);
    return absoluteToTransformReady(absoluteUrl, siteUrl, actualOptions);
}

export default toTransformReady;
module.exports = toTransformReady;
