import {URL} from 'url';
import relativeToAbsolute = require('./relative-to-absolute');

interface RelativeToTransformReadyOptions {
    replacementStr?: string;
    staticImageUrlPrefix?: string;
    assetsOnly?: boolean;
    secure?: boolean;
}

const relativeToTransformReady = function (url: string, root: string, itemPath?: string | RelativeToTransformReadyOptions | null, _options?: RelativeToTransformReadyOptions): string {
    // itemPath is optional, if it's an object may be the options param instead
    if (typeof itemPath === 'object' && !_options) {
        _options = itemPath;
        itemPath = null;
    }

    const defaultOptions: RelativeToTransformReadyOptions = {
        replacementStr: '__GHOST_URL__',
        staticImageUrlPrefix: 'content/images'
    };
    const overrideOptions: RelativeToTransformReadyOptions = {
        secure: false
    };
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    // convert to absolute
    const absoluteUrl = relativeToAbsolute(url, root, itemPath || null, options);

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

export = relativeToTransformReady;
