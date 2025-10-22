function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface TransformReadyToAbsoluteOptions {
    replacementStr?: string;
}

export const transformReadyToAbsolute = function (str = '', root: string, _options: TransformReadyToAbsoluteOptions = {}): string {
    const defaultOptions: TransformReadyToAbsoluteOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (!str || str.indexOf(options.replacementStr!) === -1) {
        return str;
    }

    const replacementRegex = new RegExp(escapeRegExp(options.replacementStr!), 'g');

    return str.replace(replacementRegex, root.replace(/\/$/, ''));
};

export default transformReadyToAbsolute;
