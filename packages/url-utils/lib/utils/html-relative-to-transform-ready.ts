import htmlTransform = require('./html-transform');
import relativeToTransformReady from './relative-to-transform-ready';

export interface HtmlRelativeToTransformReadyOptions {
    replacementStr?: string;
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
    secure?: boolean;
    earlyExitMatchStr?: string;
}

export const htmlRelativeToTransformReady = function (html = '', root: string, itemPath?: string | HtmlRelativeToTransformReadyOptions | null, _options?: HtmlRelativeToTransformReadyOptions): string {
    // itemPath is optional, if it's an object may be the options param instead
    let actualItemPath: string | null | undefined = itemPath as string | null | undefined;
    if (typeof itemPath === 'object' && !_options) {
        _options = itemPath as HtmlRelativeToTransformReadyOptions;
        actualItemPath = null;
    }

    const defaultOptions: HtmlRelativeToTransformReadyOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const overrideOptions: HtmlRelativeToTransformReadyOptions = {
        secure: false
    };
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    // exit early and avoid parsing if the content does not contain an attribute we might transform
    options.earlyExitMatchStr = 'href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    return htmlTransform(html, root, relativeToTransformReady, actualItemPath as string | null, options);
};

export default htmlRelativeToTransformReady;
