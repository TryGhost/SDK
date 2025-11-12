function deduplicateDoubleSlashes(url: string): string {
    return url.replace(/\/\//g, '/');
}

export default deduplicateDoubleSlashes;
