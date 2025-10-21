import relativeToTransformReady, {type RelativeToTransformReadyOptionsInput} from './relative-to-transform-ready';

const plaintextRelativeToTransformReady = function plaintextRelativeToTransformReady(
    plaintext: string,
    rootUrl: string,
    itemPath?: string | RelativeToTransformReadyOptionsInput | null,
    options?: RelativeToTransformReadyOptionsInput
): string {
    let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
    let resolvedOptions: RelativeToTransformReadyOptionsInput | undefined = options;

    if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
        resolvedOptions = itemPath;
        resolvedItemPath = null;
    }

    // plaintext links look like "Link title [url]"
    // those are all we care about so we can do a fast regex here
    return plaintext.replace(/ \[(\/.*?)\]/g, function (_fullMatch, path) {
        const newPath = relativeToTransformReady(`${path}`, rootUrl, resolvedItemPath, resolvedOptions);
        return ` [${newPath}]`;
    });
};

export default plaintextRelativeToTransformReady;
