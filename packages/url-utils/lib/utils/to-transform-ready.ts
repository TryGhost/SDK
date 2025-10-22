import relativeToAbsolute = require('./relative-to-absolute');
import absoluteToTransformReady = require('./absolute-to-transform-ready');

interface ToTransformReadyOptions {
    replacementStr?: string;
    staticImageUrlPrefix?: string;
    assetsOnly?: boolean;
    withoutSubdirectory?: boolean;
}

function toTransformReady(url: string, siteUrl: string, itemPath?: string | ToTransformReadyOptions | null, options?: ToTransformReadyOptions): string {
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = null;
    }
    const absoluteUrl = relativeToAbsolute(url, siteUrl, itemPath || null, options);
    return absoluteToTransformReady(absoluteUrl, siteUrl, options);
}

export = toTransformReady;
