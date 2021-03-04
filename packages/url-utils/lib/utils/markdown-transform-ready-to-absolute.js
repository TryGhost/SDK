function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const markdownTransformReadyToAbsolute = function (markdown = '', root, _options = {}) {
    const defaultOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (!markdown || markdown.indexOf(options.replacementStr) === -1) {
        return markdown;
    }

    const replacementRegex = new RegExp(escapeRegExp(options.replacementStr), 'g');

    return markdown.replace(replacementRegex, root.replace(/\/$/, ''));
};

module.exports = markdownTransformReadyToAbsolute;
