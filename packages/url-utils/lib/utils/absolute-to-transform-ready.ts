import {URL} from 'url';
import absoluteToRelative = require('./absolute-to-relative');

interface AbsoluteToTransformReadyOptions {
    replacementStr?: string;
    withoutSubdirectory?: boolean;
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
}

const absoluteToTransformReady = function (url: string, root: string, _options?: AbsoluteToTransformReadyOptions): string {
    const defaultOptions: AbsoluteToTransformReadyOptions = {
        replacementStr: '__GHOST_URL__',
        withoutSubdirectory: true
    };
    const options = Object.assign({}, defaultOptions, _options);

    // return relative urls as-is
    try {
        const parsedURL = new URL(url, 'http://relative');
        if (parsedURL.origin === 'http://relative') {
            return url;
        }
    } catch (e) {
        // url was unparseable
        return url;
    }

    // convert to relative with stripped subdir
    // always returns root-relative starting with forward slash
    const relativeUrl = absoluteToRelative(url, root, options);

    // return still absolute urls as-is (eg. external site, mailto, etc)
    try {
        const parsedURL = new URL(relativeUrl, 'http://relative');
        if (parsedURL.origin !== 'http://relative') {
            return url;
        }
    } catch (e) {
        // url was unparseable
        return url;
    }

    return `${options.replacementStr}${relativeUrl}`;
};

export = absoluteToTransformReady;
