import type {TransformReadyReplacementOptions, TransformReadyReplacementOptionsInput} from './types';

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const transformReadyToAbsolute = function (str: string = '', root: string, _options: TransformReadyReplacementOptionsInput = {}): string {
    const defaultOptions: TransformReadyReplacementOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const options: TransformReadyReplacementOptions = {
        ...defaultOptions,
        ..._options
    };

    if (!str || str.indexOf(options.replacementStr) === -1) {
        return str;
    }

    const replacementRegex = new RegExp(escapeRegExp(options.replacementStr), 'g');

    return str.replace(replacementRegex, root.replace(/\/$/, ''));
};

export default transformReadyToAbsolute;
