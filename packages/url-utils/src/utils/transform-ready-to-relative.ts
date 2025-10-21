import type {TransformReadyReplacementOptions, TransformReadyReplacementOptionsInput} from './types';

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const transformReadyToRelative = function (str: string = '', root: string, _options: TransformReadyReplacementOptionsInput = {}): string {
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

    const rootURL = new URL(root);
    // subdir with no trailing slash because we'll always have a trailing slash after the magic string
    const subdir = rootURL.pathname.replace(/\/$/, '');

    const replacementRegex = new RegExp(escapeRegExp(options.replacementStr), 'g');

    return str.replace(replacementRegex, subdir);
};

export default transformReadyToRelative;
