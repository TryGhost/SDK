const htmlTransform = require('./_html-transform');
const relativeToTransformReady = require('./relative-to-transform-ready');

const htmlRelativeToTransformReady = function (html = '', root, itemPath, _options) {
    const defaultOptions = {
        replacementStr: '__GHOST_URL__'
    };
    const overrideOptions = {
        secure: false
    };
    const options = Object.assign({}, defaultOptions, _options, overrideOptions);

    // exit early and avoid parsing if the content does not contain an attribute we might transform
    options.earlyExitMatchStr = 'href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    return htmlTransform(html, root, relativeToTransformReady, itemPath, options);
};

module.exports = htmlRelativeToTransformReady;
