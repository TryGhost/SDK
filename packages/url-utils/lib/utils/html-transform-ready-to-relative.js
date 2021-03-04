function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const htmlTransformReadyToRelative = function (html = '', root, _options = {}) {
    const defaultOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (!html || html.indexOf(options.replacementStr) === -1) {
        return html;
    }

    const rootURL = new URL(root);
    // subdir with no trailing slash because we'll always have a trailing slash after the magic string
    const subdir = rootURL.pathname.replace(/\/$/, '');

    const replacementRegex = new RegExp(escapeRegExp(options.replacementStr), 'g');

    return html.replace(replacementRegex, subdir);
};

module.exports = htmlTransformReadyToRelative;
