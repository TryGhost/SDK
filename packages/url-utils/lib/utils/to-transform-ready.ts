import relativeToAbsolute from './relative-to-absolute';
import absoluteToTransformReady from './absolute-to-transform-ready';

interface ToTransformReadyOptions {
    replacementStr?: string;
    staticImageUrlPrefix?: string;
    assetsOnly?: boolean;
    withoutSubdirectory?: boolean;
}

function toTransformReady(url: string, siteUrl: string, itemPath?: string | ToTransformReadyOptions | null, options?: ToTransformReadyOptions): string {
    let actualItemPath: string | null | undefined = itemPath as string | null | undefined;
    if (typeof itemPath === 'object' && !options) {
        options = itemPath as ToTransformReadyOptions;
        actualItemPath = null;
    }
    const absoluteUrl = relativeToAbsolute(url, siteUrl, actualItemPath || null, options);
    return absoluteToTransformReady(absoluteUrl, siteUrl, options);
}

export default toTransformReady;
