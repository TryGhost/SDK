import type {HtmlTransformOptionsInput} from './types';
import htmlTransform from './html-transform';
import relativeToTransformReady, {type RelativeToTransformReadyOptionsInput as RelativeToTransformReadyOptionsInputType} from './relative-to-transform-ready';

const htmlRelativeToTransformReady = function (
    html: string = '',
    root: string,
    itemPath: string | null | RelativeToTransformReadyOptionsInputType,
    _options?: RelativeToTransformReadyOptionsInputType
): string {
    // itemPath is optional, if it's an object may be the options param instead
    let finalItemPath: string | null = null;
    let finalOptions: RelativeToTransformReadyOptionsInputType = _options || {};

    if (typeof itemPath === 'object' && itemPath !== null && !_options) {
        finalOptions = itemPath;
        finalItemPath = null;
    } else if (typeof itemPath === 'string') {
        finalItemPath = itemPath;
    }

    const defaultOptions: RelativeToTransformReadyOptionsInputType = {
        replacementStr: '__GHOST_URL__'
    };
    const overrideOptions: RelativeToTransformReadyOptionsInputType = {
        secure: false
    };
    const options: HtmlTransformOptionsInput = Object.assign({}, defaultOptions, finalOptions, overrideOptions);

    // exit early and avoid parsing if the content does not contain an attribute we might transform
    options.earlyExitMatchStr = 'href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    return htmlTransform(html, root, relativeToTransformReady, finalItemPath, options);
};

export default htmlRelativeToTransformReady;
