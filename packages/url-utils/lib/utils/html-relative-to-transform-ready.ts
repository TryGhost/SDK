import htmlTransform = require('./html-transform');
import relativeToTransformReady = require('./relative-to-transform-ready');

interface HtmlRelativeToTransformReadyOptions {
    replacementStr?: string;
    assetsOnly?: boolean;
    staticImageUrlPrefix?: string;
    secure?: boolean;
    earlyExitMatchStr?: string;
}

const htmlRelativeToTransformReady = function (html = '', root: string, itemPath?: string | HtmlRelativeToTransformReadyOptions | null, _options?: HtmlRelativeToTransformReadyOptions): string {
    // itemPath is optional, if it's an object may be the options param instead
    if (typeof itemPath === 'object' && !_options) {
        _options = itemPath;
        itemPath = null;
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

    return htmlTransform(html, root, relativeToTransformReady, itemPath as string | null, options);
};

export = htmlRelativeToTransformReady;
