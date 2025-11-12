function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const transformReadyToAbsolute = function (str = '', root, _options = {}) {
    const defaultOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (!str || str.indexOf(options.replacementStr) === -1) {
        return str;
    }

    const replacementRegex = new RegExp(escapeRegExp(options.replacementStr), 'g');

    return str.replace(replacementRegex, root.replace(/\/$/, ''));
};

module.exports = transformReadyToAbsolute;
