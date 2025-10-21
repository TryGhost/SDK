import absoluteToRelative, {type AbsoluteToRelativeOptionsInput} from './absolute-to-relative';
import type {TransformReadyReplacementOptions, TransformReadyReplacementOptionsInput} from './types';

export interface AbsoluteToTransformReadyOptions extends TransformReadyReplacementOptions {
    withoutSubdirectory: boolean;
    ignoreProtocol: boolean;
    assetsOnly: boolean;
    staticImageUrlPrefix: string;
}

export type AbsoluteToTransformReadyOptionsInput = Partial<AbsoluteToTransformReadyOptions>;

const absoluteToTransformReady = function (url: string, root: string, _options?: AbsoluteToTransformReadyOptionsInput): string {
    const defaultOptions: AbsoluteToTransformReadyOptions = {
        replacementStr: '__GHOST_URL__',
        withoutSubdirectory: true,
        ignoreProtocol: true,
        assetsOnly: false,
        staticImageUrlPrefix: 'content/images'
    };
    const options: AbsoluteToTransformReadyOptions = {
        ...defaultOptions,
        ..._options
    };

    // return relative urls as-is
    try {
        const parsedURL = new URL(url, 'http://relative');
        if (parsedURL.origin === 'http://relative') {
            return url;
        }
    } catch (e) {
        // url was unparseable
        return url;
    }

    // convert to relative with stripped subdir
    // always returns root-relative starting with forward slash
    const relativeUrl = absoluteToRelative(url, root, {
        ignoreProtocol: options.ignoreProtocol,
        withoutSubdirectory: options.withoutSubdirectory,
        assetsOnly: options.assetsOnly,
        staticImageUrlPrefix: options.staticImageUrlPrefix
    } satisfies AbsoluteToRelativeOptionsInput);

    // return still absolute urls as-is (eg. external site, mailto, etc)
    try {
        const parsedURL = new URL(relativeUrl, 'http://relative');
        if (parsedURL.origin !== 'http://relative') {
            return url;
        }
    } catch (e) {
        // url was unparseable
        return url;
    }

    return `${options.replacementStr}${relativeUrl}`;
};

export default absoluteToTransformReady;
