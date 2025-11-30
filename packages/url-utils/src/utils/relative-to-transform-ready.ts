import type {
    TransformReadyReplacementOptions
} from './types';
import relativeToAbsolute from './relative-to-absolute';
import {URL} from 'url';

export interface RelativeToTransformReadyOptions extends TransformReadyReplacementOptions {
    staticImageUrlPrefix: string;
    secure: boolean;
}

export type RelativeToTransformReadyOptionsInput = Partial<RelativeToTransformReadyOptions>;

const relativeToTransformReady = function (
    url: string,
    root: string,
    itemPath: string | null | RelativeToTransformReadyOptionsInput,
    _options?: RelativeToTransformReadyOptionsInput
): string {
    // itemPath is optional, if it's an object may be the options param instead
    let finalItemPath: string | null = null;
    let finalOptions: RelativeToTransformReadyOptionsInput = _options || {};
    
    if (typeof itemPath === 'object' && itemPath !== null && !_options) {
        finalOptions = itemPath;
        finalItemPath = null;
    } else if (typeof itemPath === 'string') {
        finalItemPath = itemPath;
    }

    const defaultOptions: RelativeToTransformReadyOptionsInput = {
        replacementStr: '__GHOST_URL__',
        staticImageUrlPrefix: 'content/images',
        secure: false
    };
    const options = Object.assign({}, defaultOptions, finalOptions);

    // convert to absolute
    const absoluteUrl = relativeToAbsolute(url, root, finalItemPath, options);

    if (absoluteUrl === url) {
        return url;
    }

    const rootUrl: URL = new URL(root);
    const rootPathname = rootUrl.pathname.replace(/\/$/, '');

    // only convert to transform-ready if root url has no subdirectory or the subdirectory matches
    if (!url.match(/^\//) || rootPathname === '' || url.indexOf(rootPathname) === 0 || url.indexOf(`/${options.staticImageUrlPrefix}`) === 0) {
        // normalize root to match the protocol of absoluteUrl (in case secure option changed it)
        const absoluteUrlParsed = new URL(absoluteUrl);
        const normalizedRoot = `${absoluteUrlParsed.protocol}//${rootUrl.host}${rootUrl.pathname}`.replace(/\/$/, '');
        
        // replace root with replacement string
        const transformedUrl = absoluteUrl
            .replace(normalizedRoot, `${options.replacementStr}`)
            .replace(/([^:])\/\//g, '$1/');

        return transformedUrl;
    }

    return url;
};

export default relativeToTransformReady;
