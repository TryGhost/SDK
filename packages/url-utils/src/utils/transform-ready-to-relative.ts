import {URL} from 'url';

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface TransformReadyToRelativeOptions {
    replacementStr?: string;
}

const transformReadyToRelative = function (str: string = '', root: string, _options: TransformReadyToRelativeOptions = {}): string {
    const defaultOptions: Required<TransformReadyToRelativeOptions> = {
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

export default transformReadyToRelative;
module.exports = transformReadyToRelative;
