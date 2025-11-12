// require the whatwg compatible URL library (same behaviour in node and browser)
import {URL} from 'url';
import urlJoin from './url-join';

// NOTE: Ghost's relative->absolute handling is a little strange when the rootUrl
// includes a subdirectory. Root-relative paths such as /content/image.jpg are
// actually treated as subdirectory-relative. This means that it's possible to
// migrate from a root config to a subdirectory config without migrating data
// in the database, _however_ that means that the database will now have a mix
// of path styles (/content/image.png and /subdir/content/image.png). To handle
// this when all root-relative paths are treated as subdir-relative we have to
// rely on subdirectory deduplication.

interface RelativeToAbsoluteOptions {
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
    secure?: boolean;
}

/**
 * Convert a root-relative path to an absolute URL based on the supplied root.
 * Will _only_ convert root-relative urls (/some/path not some/path)
 *
 * @param {string} path
 * @param {string} rootUrl
 * @param {string} itemPath
 * @param {object} options
 * @returns {string} The passed in url or an absolute URL using
 */
const relativeToAbsolute = function relativeToAbsolute(
    path: string,
    rootUrl: string,
    itemPath?: string | RelativeToAbsoluteOptions | null,
    _options?: RelativeToAbsoluteOptions
): string {
    // itemPath is optional, if it's an object it may be the options param instead
    let actualItemPath: string | null = null;
    let actualOptions: RelativeToAbsoluteOptions;
    
    if (itemPath && typeof itemPath === 'object' && !_options) {
        actualOptions = itemPath;
        actualItemPath = null;
    } else {
        actualOptions = _options || {};
        actualItemPath = typeof itemPath === 'string' ? itemPath : null;
    }

    // itemPath could be sent as a full url in which case, extract the pathname
    if (actualItemPath && actualItemPath.match(/^http/)) {
        const itemUrl = new URL(actualItemPath);
        actualItemPath = itemUrl.pathname;
    }

    const defaultOptions: Required<RelativeToAbsoluteOptions> = {
        assetsOnly: false,
        staticImageUrlPrefix: 'content/images',
        secure: false
    };
    const options = Object.assign({}, defaultOptions, actualOptions);

    // return the path as-is if it's not an asset path and we're only modifying assets
    if (options.assetsOnly) {
        const staticImageUrlPrefixRegex = new RegExp(options.staticImageUrlPrefix);
        if (!path.match(staticImageUrlPrefixRegex)) {
            return path;
        }
    }

    // if URL is absolute return it as-is
    try {
        const parsed = new URL(path, 'http://relative');

        if (parsed.origin !== 'http://relative') {
            return path;
        }

        // Do not convert protocol relative URLs
        if (path.lastIndexOf('//', 0) === 0) {
            return path;
        }
    } catch (e) {
        return path;
    }

    // return the path as-is if it's a pure hash param
    if (path.startsWith('#')) {
        return path;
    }

    // return the path as-is if it's not root-relative and we have no itemPath
    if (!itemPath && !path.match(/^\//)) {
        return path;
    }

    // force root to always have a trailing-slash for consistent behaviour
    if (!rootUrl.endsWith('/')) {
        rootUrl = `${rootUrl}/`;
    }

    const parsedRootUrl = new URL(rootUrl);
    const basePath = path.startsWith('/') ? '' : (actualItemPath || '');
    const fullPath = urlJoin([parsedRootUrl.pathname, basePath, path], {rootUrl});
    const absoluteUrl = new URL(fullPath, rootUrl);

    if (options.secure) {
        absoluteUrl.protocol = 'https:';
    }

    return absoluteUrl.toString();
};

export default relativeToAbsolute;
