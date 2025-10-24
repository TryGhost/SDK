import plaintextAbsoluteToTransformReady from './plaintext-absolute-to-transform-ready';
import type {AbsoluteToTransformReadyOptionsInput} from './absolute-to-transform-ready';
import plaintextRelativeToTransformReady from './plaintext-relative-to-transform-ready';

export type PlaintextToTransformReadyOptions = AbsoluteToTransformReadyOptionsInput;

function plaintextToTransformReady(
    plaintext: string,
    siteUrl: string,
    itemPath?: string | PlaintextToTransformReadyOptions | null,
    options?: PlaintextToTransformReadyOptions
): string {
    let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
    let resolvedOptions: PlaintextToTransformReadyOptions | undefined = options;

    if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
        resolvedOptions = itemPath;
    }

    const relativeTransformed = plaintextRelativeToTransformReady(plaintext, siteUrl, resolvedItemPath, resolvedOptions);
    return plaintextAbsoluteToTransformReady(relativeTransformed, siteUrl, resolvedOptions);
}

export default plaintextToTransformReady;
