const markdownTransform = require('./_markdown-transform');
const htmlRelativeToAbsolute = require('./html-relative-to-absolute');
const relativeToAbsolute = require('./relative-to-absolute');

function markdownRelativeToAbsolute(markdown = '', siteUrl, itemPath, _options = {}) {
    const defaultOptions = {assetsOnly: false};
    const options = Object.assign({}, defaultOptions, _options);

    options.earlyExitMatchStr = '\\]\\([^\\s\\)]|href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    const transformFunctions = {
        html: htmlRelativeToAbsolute,
        url: relativeToAbsolute
    };

    return markdownTransform(markdown, siteUrl, transformFunctions, itemPath, options);
}

module.exports = markdownRelativeToAbsolute;
