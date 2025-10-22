import {URL} from 'url';
import plaintextRelativeToTransformReady from './plaintext-relative-to-transform-ready';
import plaintextAbsoluteToTransformReady from './plaintext-absolute-to-transform-ready';

interface PlaintextToTransformReadyOptions {
    replacementStr?: string;
    staticImageUrlPrefix?: string;
    assetsOnly?: boolean;
    secure?: boolean;
    withoutSubdirectory?: boolean;
}

function plaintextToTransformReady(plaintext: string, siteUrl: string, itemPath?: string | PlaintextToTransformReadyOptions, options?: PlaintextToTransformReadyOptions): string {
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = undefined;
    }
    const relativeTransformed = plaintextRelativeToTransformReady(plaintext, siteUrl, itemPath, options);
    return plaintextAbsoluteToTransformReady(relativeTransformed, siteUrl, options);
}

export = plaintextToTransformReady;
