function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const markdownTransformReadyToRelative = function (markdown = '', root, _options = {}) {
    const defaultOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (!markdown || markdown.indexOf(options.replacementStr) === -1) {
        return markdown;
    }

    const rootURL = new URL(root);
    // subdir with no trailing slash because we'll always have a trailing slash after the magic string
    const subdir = rootURL.pathname.replace(/\/$/, '');

    const replacementRegex = new RegExp(escapeRegExp(options.replacementStr), 'g');

    return markdown.replace(replacementRegex, subdir);
};

module.exports = markdownTransformReadyToRelative;
