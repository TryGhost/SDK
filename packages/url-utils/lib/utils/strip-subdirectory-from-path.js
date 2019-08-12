const {URL} = require('url');

/**
 * Removes the directory in the root url from the relative path
 *
 * @param {string} path Relative path (eg, '/my/subdir/my/file.png)
 * @param {string} rootUrl Root URL (eg, 'https://mysite.com/my/subdir/)
 * @returns {string} Path relative to the rootUrl's path
 */
const stripSubdirectoryFromPath = function stripSubdirectoryFromPath(path, rootUrl) {
    // force root to always have a trailing-slash for consistent behaviour
    if (!rootUrl.endsWith('/')) {
        rootUrl = `${rootUrl}/`;
    }

    const parsedRoot = new URL(rootUrl);

    // do nothing if rootUrl does not have a subdirectory
    if (parsedRoot.pathname === '/') {
        return path;
    }

    if (path.startsWith(parsedRoot.pathname)) {
        return path.replace(parsedRoot.pathname, '/');
    }

    return path;
};

module.exports = stripSubdirectoryFromPath;
