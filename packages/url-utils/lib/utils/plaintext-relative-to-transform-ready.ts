import {URL} from 'url';
import relativeToTransformReady = require('./relative-to-transform-ready');

interface PlaintextRelativeToTransformReadyOptions {
    replacementStr?: string;
    staticImageUrlPrefix?: string;
    assetsOnly?: boolean;
    secure?: boolean;
}

const plaintextRelativeToTransformReady = function plaintextRelativeToTransformReady(plaintext: string, rootUrl: string, itemPath?: string | PlaintextRelativeToTransformReadyOptions, options?: PlaintextRelativeToTransformReadyOptions): string {
    // itemPath is optional, if it's an object may be the options param instead
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = undefined;
    }

    // plaintext links look like "Link title [url]"
    // those are all we care about so we can do a fast regex here
    return plaintext.replace(/ \[(\/.*?)\]/g, function (fullMatch: string, path: string): string {
        const newPath = relativeToTransformReady(`${path}`, rootUrl, itemPath, options);
        return ` [${newPath}]`;
    });
};

export = plaintextRelativeToTransformReady;
