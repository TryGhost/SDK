// @ts-nocheck
import deduplicateDoubleSlashes from './deduplicate-double-slashes';
import deduplicateSubdirectory from './deduplicate-subdirectory';
import isSSL from './is-ssl';
import replacePermalink from './replace-permalink';
import stripSubdirectoryFromPath from './strip-subdirectory-from-path';
import urlJoin from './url-join';

module.exports = {
    absoluteToRelative: require('./absolute-to-relative'),
    absoluteToTransformReady: require('./absolute-to-transform-ready'),
    deduplicateDoubleSlashes,
    deduplicateSubdirectory,
    htmlAbsoluteToRelative: require('./html-absolute-to-relative'),
    htmlRelativeToAbsolute: require('./html-relative-to-absolute'),
    htmlAbsoluteToTransformReady: require('./html-absolute-to-transform-ready'),
    htmlRelativeToTransformReady: require('./html-relative-to-transform-ready'),
    htmlToTransformReady: require('./html-to-transform-ready'),
    isSSL,
    markdownAbsoluteToRelative: require('./markdown-absolute-to-relative'),
    markdownRelativeToAbsolute: require('./markdown-relative-to-absolute'),
    markdownAbsoluteToTransformReady: require('./markdown-absolute-to-transform-ready'),
    markdownRelativeToTransformReady: require('./markdown-relative-to-transform-ready'),
    markdownToTransformReady: require('./markdown-to-transform-ready'),
    mobiledocAbsoluteToRelative: require('./mobiledoc-absolute-to-relative'),
    mobiledocRelativeToAbsolute: require('./mobiledoc-relative-to-absolute'),
    mobiledocAbsoluteToTransformReady: require('./mobiledoc-absolute-to-transform-ready'),
    mobiledocRelativeToTransformReady: require('./mobiledoc-relative-to-transform-ready'),
    mobiledocToTransformReady: require('./mobiledoc-to-transform-ready'),
    lexicalAbsoluteToRelative: require('./lexical-absolute-to-relative'),
    lexicalRelativeToAbsolute: require('./lexical-relative-to-absolute'),
    lexicalAbsoluteToTransformReady: require('./lexical-absolute-to-transform-ready'),
    lexicalRelativeToTransformReady: require('./lexical-relative-to-transform-ready'),
    lexicalToTransformReady: require('./lexical-to-transform-ready'),
    plaintextAbsoluteToTransformReady: require('./plaintext-absolute-to-transform-ready'),
    plaintextRelativeToTransformReady: require('./plaintext-relative-to-transform-ready'),
    plaintextToTransformReady: require('./plaintext-to-transform-ready'),
    relativeToAbsolute: require('./relative-to-absolute'),
    relativeToTransformReady: require('./relative-to-transform-ready'),
    replacePermalink,
    stripSubdirectoryFromPath,
    toTransformReady: require('./to-transform-ready'),
    transformReadyToAbsolute: require('./transform-ready-to-absolute'),
    transformReadyToRelative: require('./transform-ready-to-relative'),
    urlJoin
};
