import type {UnknownRecord} from './types';
import plaintextRelativeToTransformReady from './plaintext-relative-to-transform-ready';
import plaintextAbsoluteToTransformReady from './plaintext-absolute-to-transform-ready';

type PlaintextTransformOptions = UnknownRecord;
type PlaintextTransformOptionsInput = Partial<PlaintextTransformOptions>;

function plaintextToTransformReady(
    plaintext: string,
    siteUrl: string,
    itemPath: string | null | PlaintextTransformOptionsInput,
    options?: PlaintextTransformOptionsInput
): string {
    let finalItemPath: string | null = null;
    let finalOptions: PlaintextTransformOptionsInput = options || {};

    if (typeof itemPath === 'object' && itemPath !== null && !options) {
        finalOptions = itemPath;
        finalItemPath = null;
    } else if (typeof itemPath === 'string') {
        finalItemPath = itemPath;
    }

    const relativeTransformed = plaintextRelativeToTransformReady(plaintext, siteUrl, finalItemPath, finalOptions);
    return plaintextAbsoluteToTransformReady(relativeTransformed, siteUrl, finalOptions);
}

export default plaintextToTransformReady;
