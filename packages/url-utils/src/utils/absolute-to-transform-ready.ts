import type {TransformReadyReplacementOptions} from './types';
import absoluteToRelative, {type AbsoluteToRelativeOptions} from './absolute-to-relative';
import {URL} from 'url';

export interface AbsoluteToTransformReadyOptions extends TransformReadyReplacementOptions, AbsoluteToRelativeOptions {
    withoutSubdirectory: boolean;
    staticFilesUrlPrefix?: string;
    staticMediaUrlPrefix?: string;
    imageBaseUrl?: string | null;
    filesBaseUrl?: string | null;
    mediaBaseUrl?: string | null;
}

export type AbsoluteToTransformReadyOptionsInput = Partial<AbsoluteToTransformReadyOptions>;

function isRelative(url: string): boolean {
    let parsedInput: URL;
    try {
        parsedInput = new URL(url, 'http://relative');
    } catch (e) {
        // url was unparseable
        return false;
    }

    return parsedInput.origin === 'http://relative';
}

const absoluteToTransformReady = function (
    url: string,
    root: string,
    _options: AbsoluteToTransformReadyOptionsInput = {}
): string {
    const defaultOptions: AbsoluteToTransformReadyOptions = {
        replacementStr: '__GHOST_URL__',
        withoutSubdirectory: true,
        staticImageUrlPrefix: 'content/images',
        staticFilesUrlPrefix: 'content/files',
        staticMediaUrlPrefix: 'content/media',
        imageBaseUrl: null,
        filesBaseUrl: null,
        mediaBaseUrl: null,
        ignoreProtocol: true,
        assetsOnly: false
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (isRelative(url)) {
        return url;
    }

    // convert to relative with stripped subdir
    // always returns root-relative starting with forward slash
    const rootRelativeUrl = absoluteToRelative(url, root, options);

    if (isRelative(rootRelativeUrl)) {
        return `${options.replacementStr}${rootRelativeUrl}`;
    }

    if (options.mediaBaseUrl) {
        const mediaRelativeUrl = absoluteToRelative(url, options.mediaBaseUrl, options);

        if (isRelative(mediaRelativeUrl)) {
            return `${options.replacementStr}${mediaRelativeUrl}`;
        }
    }

    if (options.filesBaseUrl) {
        const filesRelativeUrl = absoluteToRelative(url, options.filesBaseUrl, options);

        if (isRelative(filesRelativeUrl)) {
            return `${options.replacementStr}${filesRelativeUrl}`;
        }
    }

    if (options.imageBaseUrl) {
        const imageRelativeUrl = absoluteToRelative(url, options.imageBaseUrl, options);

        if (isRelative(imageRelativeUrl)) {
            return `${options.replacementStr}${imageRelativeUrl}`;
        }
    }

    return url;
};

export default absoluteToTransformReady;
