function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const mobiledocTransformReadyToAbsolute = function (mobiledoc = '', root, _options = {}) {
    const defaultOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (!mobiledoc || mobiledoc.indexOf(options.replacementStr) === -1) {
        return mobiledoc;
    }

    const replacementRegex = new RegExp(escapeRegExp(options.replacementStr), 'g');

    return mobiledoc.replace(replacementRegex, root.replace(/\/$/, ''));
};

module.exports = mobiledocTransformReadyToAbsolute;
