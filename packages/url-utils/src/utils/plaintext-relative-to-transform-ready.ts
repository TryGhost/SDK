import relativeToTransformReady from './relative-to-transform-ready';

interface PlaintextRelativeToTransformReadyOptions {
    replacementStr?: string;
    staticImageUrlPrefix?: string;
    secure?: boolean;
}

const plaintextRelativeToTransformReady = function plaintextRelativeToTransformReady(
    plaintext: string,
    rootUrl: string,
    itemPath?: string | PlaintextRelativeToTransformReadyOptions | null,
    options?: PlaintextRelativeToTransformReadyOptions
): string {
    // itemPath is optional, if it's an object may be the options param instead
    let actualItemPath: string | null = null;
    let actualOptions: PlaintextRelativeToTransformReadyOptions;
    
    if (itemPath && typeof itemPath === 'object' && !options) {
        actualOptions = itemPath;
        actualItemPath = null;
    } else {
        actualOptions = options || {};
        actualItemPath = typeof itemPath === 'string' ? itemPath : null;
    }

    // plaintext links look like "Link title [url]"
    // those are all we care about so we can do a fast regex here
    return plaintext.replace(/ \[(\/.*?)\]/g, function (_fullMatch: string, path: string): string {
        const newPath = relativeToTransformReady(`${path}`, rootUrl, actualItemPath, actualOptions);
        return ` [${newPath}]`;
    });
};

export default plaintextRelativeToTransformReady;
