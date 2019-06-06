function deduplicateDoubleSlashes(url) {
    return url.replace(/\/\//g, '/');
}

module.exports = deduplicateDoubleSlashes;
