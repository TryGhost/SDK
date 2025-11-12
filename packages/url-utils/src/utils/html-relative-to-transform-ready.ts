import htmlTransform from './html-transform';
import relativeToTransformReady from './relative-to-transform-ready';

interface HtmlRelativeToTransformReadyOptions {
    replacementStr?: string;
    secure?: boolean;
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
    earlyExitMatchStr?: string;
}

const htmlRelativeToTransformReady = function (
    html: string = '',
    root: string,
    itemPath?: string | HtmlRelativeToTransformReadyOptions | null,
    _options?: HtmlRelativeToTransformReadyOptions
): string {
    // itemPath is optional, if it's an object may be the options param instead
    let actualItemPath: string | null = null;
    let actualOptions: HtmlRelativeToTransformReadyOptions;
    
    if (itemPath && typeof itemPath === 'object' && !_options) {
        actualOptions = itemPath;
        actualItemPath = null;
    } else {
        actualOptions = _options || {};
        actualItemPath = typeof itemPath === 'string' ? itemPath : null;
    }

    const defaultOptions: Required<Pick<HtmlRelativeToTransformReadyOptions, 'replacementStr'>> = {
        replacementStr: '__GHOST_URL__'
    };
    const overrideOptions = {
        secure: false
    };
    const options = Object.assign({}, defaultOptions, actualOptions, overrideOptions);

    // exit early and avoid parsing if the content does not contain an attribute we might transform
    options.earlyExitMatchStr = 'href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    return htmlTransform(html, root, relativeToTransformReady, actualItemPath || '', options);
};

export default htmlRelativeToTransformReady;
