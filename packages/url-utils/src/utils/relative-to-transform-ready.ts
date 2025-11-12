import {URL} from 'url';
import relativeToAbsolute from './relative-to-absolute';

interface RelativeToTransformReadyOptions {
    replacementStr?: string;
    staticImageUrlPrefix?: string;
    secure?: boolean;
}

const relativeToTransformReady = function (
    url: string,
    root: string,
    itemPath?: string | RelativeToTransformReadyOptions | null,
    _options?: RelativeToTransformReadyOptions
): string {
    // itemPath is optional, if it's an object may be the options param instead
    let actualItemPath: string | null = null;
    let actualOptions: RelativeToTransformReadyOptions;
    
    if (itemPath && typeof itemPath === 'object' && !_options) {
        actualOptions = itemPath;
        actualItemPath = null;
    } else {
        actualOptions = _options || {};
        actualItemPath = typeof itemPath === 'string' ? itemPath : null;
    }

    const defaultOptions: Required<RelativeToTransformReadyOptions> = {
        replacementStr: '__GHOST_URL__',
        staticImageUrlPrefix: 'content/images',
        secure: false
    };
    const overrideOptions = {
        secure: false
    };
    const options = Object.assign({}, defaultOptions, actualOptions, overrideOptions);

    // convert to absolute
    const absoluteUrl = relativeToAbsolute(url, root, actualItemPath, options);

    if (absoluteUrl === url) {
        return url;
    }

    const rootUrl = new URL(root);
    const rootPathname = rootUrl.pathname.replace(/\/$/, '');

    // only convert to transform-ready if root url has no subdirectory or the subdirectory matches
    if (!url.match(/^\//) || rootPathname === '' || url.indexOf(rootPathname) === 0 || url.indexOf(`/${options.staticImageUrlPrefix}`) === 0) {
        // replace root with replacement string
        const transformedUrl = absoluteUrl
            .replace(root, `${options.replacementStr}/`) // always have trailing slash after magic string
            .replace(/([^:])\/\//g, '$1/');

        return transformedUrl;
    }

    return url;
};

export default relativeToTransformReady;
module.exports = relativeToTransformReady;
