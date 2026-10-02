import type {TransformReadyReplacementOptions, BaseUrlOptions} from './types';
import memoize from './memoize';

export interface TransformReadyToAbsoluteOptions extends TransformReadyReplacementOptions, BaseUrlOptions {
    staticImageUrlPrefix: string;
    staticFilesUrlPrefix: string;
    staticMediaUrlPrefix: string;
}

export type TransformReadyToAbsoluteOptionsInput = Partial<TransformReadyToAbsoluteOptions>;

export const DEFAULT_OPTIONS: Readonly<TransformReadyToAbsoluteOptions> = Object.freeze({
    replacementStr: '__GHOST_URL__',
    staticImageUrlPrefix: 'content/images',
    staticFilesUrlPrefix: 'content/files',
    staticMediaUrlPrefix: 'content/media',
    imageBaseUrl: null,
    filesBaseUrl: null,
    mediaBaseUrl: null
});

// Root and CDN base URLs are a tiny, near-static set of strings, memoize their
// trailing-slash-stripped form so we don't allocate a new string per replacement
const stripTrailingSlash = memoize(function stripTrailingSlash(url: string): string {
    return url.replace(/\/$/, '');
});

// true if `str` has `/${prefix}` at `pos`, without slicing or building strings.
// String() because a configured prefix can be null, which 5.3.0 matched as "/null"
function hasPrefixAt(str: string, pos: number, prefix: string): boolean {
    return str[pos] === '/' && str.startsWith(String(prefix), pos + 1);
}

// the CDN base url for the asset type that follows a placeholder ending at `pos`,
// or the root url if there's no CDN for it
function baseUrlFor(str: string, pos: number, root: string, options: TransformReadyToAbsoluteOptions): string {
    if (options.mediaBaseUrl && hasPrefixAt(str, pos, options.staticMediaUrlPrefix)) {
        return options.mediaBaseUrl;
    }

    if (options.filesBaseUrl && hasPrefixAt(str, pos, options.staticFilesUrlPrefix)) {
        return options.filesBaseUrl;
    }

    if (options.imageBaseUrl && hasPrefixAt(str, pos, options.staticImageUrlPrefix)) {
        return options.imageBaseUrl;
    }

    return root;
}

/**
 * Replaces every `replacementStr` in `str` with the root URL, or the matching
 * CDN base URL when the placeholder is followed by a static asset prefix.
 * Expects fully-populated options, callers are responsible for merging defaults.
 */
export function replaceTransformReadyPlaceholders(
    str: string,
    root: string,
    options: TransformReadyToAbsoluteOptions
): string {
    const {replacementStr} = options;
    let result = '';

    // an empty replacementStr matches at every position, like a global regex replace
    if (replacementStr === '') {
        for (let pos = 0; pos <= str.length; pos++) {
            result += stripTrailingSlash(baseUrlFor(str, pos, root, options)) + str.slice(pos, pos + 1);
        }
        return result;
    }

    let lastIndex = 0;
    let pos = str.indexOf(replacementStr);

    while (pos !== -1) {
        const after = pos + replacementStr.length;
        result += str.slice(lastIndex, pos) + stripTrailingSlash(baseUrlFor(str, after, root, options));
        lastIndex = after;
        pos = str.indexOf(replacementStr, lastIndex);
    }

    return result + str.slice(lastIndex);
}

const transformReadyToAbsolute = function (
    str: string = '',
    root: string,
    _options?: TransformReadyToAbsoluteOptionsInput
): string {
    if (!str) {
        return str;
    }

    const options: TransformReadyToAbsoluteOptions = _options
        ? Object.assign({}, DEFAULT_OPTIONS, _options)
        : DEFAULT_OPTIONS;

    return replaceTransformReadyPlaceholders(str, root, options);
};

export default transformReadyToAbsolute;
