const relativeToTransformReady = require('./relative-to-transform-ready');

const plaintextRelativeToTransformReady = function plaintextRelativeToTransformReady(plaintext, rootUrl, itemPath, options) {
    // itemPath is optional, if it's an object may be the options param instead
    if (typeof itemPath === 'object' && !options) {
        options = itemPath;
        itemPath = null;
    }

    // plaintext links look like "Link title [url]"
    // those are all we care about so we can do a fast regex here
    return plaintext.replace(/ \[(\/.*?)\]/g, function (fullMatch, path) {
        const newPath = relativeToTransformReady(`${path}`, rootUrl, itemPath, options);
        return ` [${newPath}]`;
    });
};

module.exports = plaintextRelativeToTransformReady;
