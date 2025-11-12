function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface TransformReadyToAbsoluteOptions {
    replacementStr?: string;
}

const transformReadyToAbsolute = function (str: string = '', root: string, _options: TransformReadyToAbsoluteOptions = {}): string {
    const defaultOptions: Required<TransformReadyToAbsoluteOptions> = {
        replacementStr: '__GHOST_URL__'
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (!str || str.indexOf(options.replacementStr) === -1) {
        return str;
    }

    const replacementRegex = new RegExp(escapeRegExp(options.replacementStr), 'g');

    return str.replace(replacementRegex, root.replace(/\/$/, ''));
};

export default transformReadyToAbsolute;
module.exports = transformReadyToAbsolute;
