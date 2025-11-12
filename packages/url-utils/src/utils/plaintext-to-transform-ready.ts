import plaintextRelativeToTransformReady from './plaintext-relative-to-transform-ready';
import plaintextAbsoluteToTransformReady from './plaintext-absolute-to-transform-ready';

interface PlaintextToTransformReadyOptions {
    replacementStr?: string;
    withoutSubdirectory?: boolean;
    staticImageUrlPrefix?: string;
    secure?: boolean;
}

function plaintextToTransformReady(
    plaintext: string,
    siteUrl: string,
    itemPath?: string | PlaintextToTransformReadyOptions | null,
    options?: PlaintextToTransformReadyOptions
): string {
    let actualItemPath: string | null = null;
    let actualOptions: PlaintextToTransformReadyOptions;
    
    if (itemPath && typeof itemPath === 'object' && !options) {
        actualOptions = itemPath;
        actualItemPath = null;
    } else {
        actualOptions = options || {};
        actualItemPath = typeof itemPath === 'string' ? itemPath : null;
    }
    const relativeTransformed = plaintextRelativeToTransformReady(plaintext, siteUrl, actualItemPath, actualOptions);
    return plaintextAbsoluteToTransformReady(relativeTransformed, siteUrl, actualItemPath, actualOptions);
}

export default plaintextToTransformReady;
module.exports = plaintextToTransformReady;
