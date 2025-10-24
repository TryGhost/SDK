import absoluteToTransformReady, {type AbsoluteToTransformReadyOptionsInput} from './absolute-to-transform-ready';
import relativeToAbsolute, {type RelativeToAbsoluteOptionsInput} from './relative-to-absolute';

export type ToTransformReadyOptions = RelativeToAbsoluteOptionsInput & AbsoluteToTransformReadyOptionsInput;

function toTransformReady(
    url: string,
    siteUrl: string,
    itemPath?: string | ToTransformReadyOptions | null,
    options?: ToTransformReadyOptions
): string {
    let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
    let resolvedOptions: ToTransformReadyOptions | undefined = options;

    if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
        resolvedOptions = itemPath;
    }

    const absoluteUrl = relativeToAbsolute(url, siteUrl, resolvedItemPath, resolvedOptions);
    return absoluteToTransformReady(absoluteUrl, siteUrl, resolvedOptions);
}

export default toTransformReady;
