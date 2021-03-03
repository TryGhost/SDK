const htmlTransform = require('./_html-transform');
const relativeToAbsolute = require('./relative-to-absolute');

function htmlRelativeToAbsolute(html = '', siteUrl, itemPath, _options) {
    const defaultOptions = {assetsOnly: false, secure: false};
    const options = Object.assign({}, defaultOptions, _options || {});

    // exit early and avoid parsing if the content does not contain an attribute we might transform
    options.earlyExitMatchStr = 'href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    return htmlTransform(html, siteUrl, relativeToAbsolute, itemPath, options);
}

module.exports = htmlRelativeToAbsolute;
