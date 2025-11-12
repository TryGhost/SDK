function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const transformReadyToRelative = function (str = '', root, _options = {}) {
    const defaultOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (!str || str.indexOf(options.replacementStr) === -1) {
        return str;
    }

    const rootURL = new URL(root);
    // subdir with no trailing slash because we'll always have a trailing slash after the magic string
    const subdir = rootURL.pathname.replace(/\/$/, '');

    const replacementRegex = new RegExp(escapeRegExp(options.replacementStr), 'g');

    return str.replace(replacementRegex, subdir);
};

module.exports = transformReadyToRelative;
