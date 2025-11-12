const deduplicateSubdirectory = require('./deduplicate-subdirectory');

/** urlJoin
* Returns a URL/path for internal use in Ghost.
* @param {string[]} parts takes parts and concats those to a valid path/URL.
* @param {Object} options
* @param {string} options.rootUrl used for deduplicating any subdirectories
* @return {string} URL concatinated URL/path of arguments.
*/
function urlJoin(parts, options) {
    let prefixDoubleSlash = false;

    // Remove empty item at the beginning
    if (parts[0] === '') {
        parts.shift();
    }

    // Handle schemeless protocols
    if (parts[0].indexOf('//') === 0) {
        prefixDoubleSlash = true;
    }

    // join the elements using a slash
    let url = parts.join('/');

    // Fix multiple slashes
    url = url.replace(/(^|[^:])\/\/+/g, '$1/');

    // Put the double slash back at the beginning if this was a schemeless protocol
    if (prefixDoubleSlash) {
        url = url.replace(/^\//, '//');
    }

    return deduplicateSubdirectory(url, options.rootUrl);
}

module.exports = urlJoin;
