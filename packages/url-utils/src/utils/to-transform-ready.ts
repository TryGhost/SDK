import type {AbsoluteToTransformReadyOptionsInput} from './absolute-to-transform-ready';
import relativeToAbsolute, {type RelativeToAbsoluteOptionsInput} from './relative-to-absolute';
import absoluteToTransformReady from './absolute-to-transform-ready';

export type ToTransformReadyOptions = RelativeToAbsoluteOptionsInput & AbsoluteToTransformReadyOptionsInput;

function toTransformReady(
    url: string,
    siteUrl: string,
    itemPath: string | null | ToTransformReadyOptions,
    options?: ToTransformReadyOptions
): string {
    let finalItemPath: string | null = null;
    let finalOptions: ToTransformReadyOptions = options || {};
    
    if (typeof itemPath === 'object' && itemPath !== null && !options) {
        finalOptions = itemPath as ToTransformReadyOptions;
        finalItemPath = null;
    } else if (typeof itemPath === 'string') {
        finalItemPath = itemPath;
    }
    
    const absoluteUrl = relativeToAbsolute(url, siteUrl, finalItemPath, finalOptions);
    return absoluteToTransformReady(absoluteUrl, siteUrl, finalOptions);
}

export default toTransformReady;
