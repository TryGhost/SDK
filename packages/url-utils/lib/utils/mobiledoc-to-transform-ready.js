const mobiledocRelativeToAbsolute = require('./mobiledoc-relative-to-absolute');
const mobiledocAbsoluteToTransformReady = require('./mobiledoc-absolute-to-transform-ready');

function mobiledocToTransformReady(mobiledoc, siteUrl, itemPath, options) {
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = null;
    }
    const absolute = mobiledocRelativeToAbsolute(mobiledoc, siteUrl, itemPath, options);
    return mobiledocAbsoluteToTransformReady(absolute, siteUrl, options);
}

module.exports = mobiledocToTransformReady;
