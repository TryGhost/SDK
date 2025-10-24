import relativeToAbsolute from './relative-to-absolute';
import type {
    TransformReadyReplacementOptions,
    TransformReadyReplacementOptionsInput
} from './types';

export interface RelativeToTransformReadyOptions extends TransformReadyReplacementOptions {
    staticImageUrlPrefix: string;
    secure: boolean;
}

export type RelativeToTransformReadyOptionsInput = Partial<RelativeToTransformReadyOptions>;

const relativeToTransformReady = function (url: string, root: string, itemPath?: string | RelativeToTransformReadyOptionsInput | null, _options?: RelativeToTransformReadyOptionsInput): string {
    let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
    let resolvedOptions: RelativeToTransformReadyOptionsInput | undefined = _options;

    if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
        resolvedOptions = itemPath;
    }

    const options: RelativeToTransformReadyOptions = {
        replacementStr: '__GHOST_URL__',
        staticImageUrlPrefix: 'content/images',
        secure: false,
        ...resolvedOptions
    };

    options.secure = false;

    // convert to absolute
    const absoluteUrl = relativeToAbsolute(url, root, resolvedItemPath, options);

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
