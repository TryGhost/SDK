import type {RelativeToTransformReadyOptionsInput} from './relative-to-transform-ready';
import relativeToTransformReady from './relative-to-transform-ready';

const plaintextRelativeToTransformReady = function plaintextRelativeToTransformReady(
    plaintext: string,
    rootUrl: string,
    itemPath: string | null | RelativeToTransformReadyOptionsInput,
    options?: RelativeToTransformReadyOptionsInput
): string {
    // itemPath is optional, if it's an object may be the options param instead
    let finalItemPath: string | null = null;
    let finalOptions: RelativeToTransformReadyOptionsInput = options || {};

    if (typeof itemPath === 'object' && itemPath !== null && !options) {
        finalOptions = itemPath;
        finalItemPath = null;
    } else if (typeof itemPath === 'string') {
        finalItemPath = itemPath;
    }

    // plaintext links look like "Link title [url]"
    // those are all we care about so we can do a fast regex here
    return plaintext.replace(/ \[(\/.*?)\]/g, function (fullMatch: string, path: string): string {
        const newPath = relativeToTransformReady(`${path}`, rootUrl, finalItemPath, finalOptions);
        return ` [${newPath}]`;
    });
};

export default plaintextRelativeToTransformReady;
