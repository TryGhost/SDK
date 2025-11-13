function deduplicateDoubleSlashes(url) {
    // Preserve protocol slashes (e.g., http://, https://) and only deduplicate
    // slashes in the path portion. The pattern (^|[^:])\/\/+ matches double slashes
    // that are either at the start of the string or not preceded by a colon.
    return url.replace(/(^|[^:])\/\/+/g, '$1/');
}

module.exports = deduplicateDoubleSlashes;
