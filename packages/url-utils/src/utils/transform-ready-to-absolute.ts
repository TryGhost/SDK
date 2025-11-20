import type {TransformReadyReplacementOptions, BaseUrlOptions} from './types';

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export interface TransformReadyToAbsoluteOptions extends TransformReadyReplacementOptions, BaseUrlOptions {
    staticImageUrlPrefix: string;
    staticFilesUrlPrefix: string;
    staticMediaUrlPrefix: string;
}

export type TransformReadyToAbsoluteOptionsInput = Partial<TransformReadyToAbsoluteOptions>;

const transformReadyToAbsolute = function (
    str: string = '',
    root: string,
    _options: TransformReadyToAbsoluteOptionsInput = {}
): string {
    const defaultOptions: TransformReadyToAbsoluteOptions = {
        replacementStr: '__GHOST_URL__',
        staticImageUrlPrefix: 'content/images',
        staticFilesUrlPrefix: 'content/files',
        staticMediaUrlPrefix: 'content/media',
        imageBaseUrl: null,
        filesBaseUrl: null,
        mediaBaseUrl: null
    };
    const options = Object.assign({}, defaultOptions, _options);

    if (!str || str.indexOf(options.replacementStr) === -1) {
        return str;
    }

    const replacementRegex = new RegExp(escapeRegExp(options.replacementStr), 'g');

    return str.replace(replacementRegex, (match: string, offset: number): string => {
        const remainder = str.slice(offset + match.length);

        if (remainder.startsWith(`/${options.staticMediaUrlPrefix}`) && options.mediaBaseUrl) {
            return options.mediaBaseUrl.replace(/\/$/, '');
        }

        if (remainder.startsWith(`/${options.staticFilesUrlPrefix}`) && options.filesBaseUrl) {
            return options.filesBaseUrl.replace(/\/$/, '');
        }

        if (remainder.startsWith(`/${options.staticImageUrlPrefix}`) && options.imageBaseUrl) {
            return options.imageBaseUrl.replace(/\/$/, '');
        }

        return root.replace(/\/$/, '');
    });
};

export default transformReadyToAbsolute;
