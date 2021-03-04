function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const htmlTransformReadyToAbsolute = function (html = '', root, _options = {}) {
    const defaultOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (!html || html.indexOf(options.replacementStr) === -1) {
        return html;
    }

    const replacementRegex = new RegExp(escapeRegExp(options.replacementStr), 'g');

    return html.replace(replacementRegex, root);
};

module.exports = htmlTransformReadyToAbsolute;
