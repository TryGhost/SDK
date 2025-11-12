import deduplicateDoubleSlashes from './deduplicate-double-slashes';
import deduplicateSubdirectory from './deduplicate-subdirectory';
import isSSL from './is-ssl';
import replacePermalink from './replace-permalink';
import stripSubdirectoryFromPath from './strip-subdirectory-from-path';
import urlJoin from './url-join';
import absoluteToRelative from './absolute-to-relative';
import absoluteToTransformReady from './absolute-to-transform-ready';
import relativeToAbsolute from './relative-to-absolute';
import relativeToTransformReady from './relative-to-transform-ready';
import toTransformReady from './to-transform-ready';
import transformReadyToAbsolute from './transform-ready-to-absolute';
import transformReadyToRelative from './transform-ready-to-relative';
import htmlAbsoluteToRelative from './html-absolute-to-relative';
import htmlRelativeToAbsolute from './html-relative-to-absolute';
import htmlAbsoluteToTransformReady from './html-absolute-to-transform-ready';
import htmlRelativeToTransformReady from './html-relative-to-transform-ready';
import htmlToTransformReady from './html-to-transform-ready';
import markdownAbsoluteToRelative from './markdown-absolute-to-relative';
import markdownRelativeToAbsolute from './markdown-relative-to-absolute';
import markdownAbsoluteToTransformReady from './markdown-absolute-to-transform-ready';
import markdownRelativeToTransformReady from './markdown-relative-to-transform-ready';
import markdownToTransformReady from './markdown-to-transform-ready';
import mobiledocAbsoluteToRelative from './mobiledoc-absolute-to-relative';
import mobiledocRelativeToAbsolute from './mobiledoc-relative-to-absolute';
import mobiledocAbsoluteToTransformReady from './mobiledoc-absolute-to-transform-ready';
import mobiledocRelativeToTransformReady from './mobiledoc-relative-to-transform-ready';
import mobiledocToTransformReady from './mobiledoc-to-transform-ready';
import lexicalAbsoluteToRelative from './lexical-absolute-to-relative';
import lexicalRelativeToAbsolute from './lexical-relative-to-absolute';
import lexicalAbsoluteToTransformReady from './lexical-absolute-to-transform-ready';
import lexicalRelativeToTransformReady from './lexical-relative-to-transform-ready';
import lexicalToTransformReady from './lexical-to-transform-ready';
import plaintextAbsoluteToTransformReady from './plaintext-absolute-to-transform-ready';
import plaintextRelativeToTransformReady from './plaintext-relative-to-transform-ready';
import plaintextToTransformReady from './plaintext-to-transform-ready';

type Utils = {
    absoluteToRelative: typeof absoluteToRelative;
    absoluteToTransformReady: typeof absoluteToTransformReady;
    deduplicateDoubleSlashes: typeof deduplicateDoubleSlashes;
    deduplicateSubdirectory: typeof deduplicateSubdirectory;
    htmlAbsoluteToRelative: typeof htmlAbsoluteToRelative;
    htmlRelativeToAbsolute: typeof htmlRelativeToAbsolute;
    htmlAbsoluteToTransformReady: typeof htmlAbsoluteToTransformReady;
    htmlRelativeToTransformReady: typeof htmlRelativeToTransformReady;
    htmlToTransformReady: typeof htmlToTransformReady;
    isSSL: typeof isSSL;
    markdownAbsoluteToRelative: typeof markdownAbsoluteToRelative;
    markdownRelativeToAbsolute: typeof markdownRelativeToAbsolute;
    markdownAbsoluteToTransformReady: typeof markdownAbsoluteToTransformReady;
    markdownRelativeToTransformReady: typeof markdownRelativeToTransformReady;
    markdownToTransformReady: typeof markdownToTransformReady;
    mobiledocAbsoluteToRelative: typeof mobiledocAbsoluteToRelative;
    mobiledocRelativeToAbsolute: typeof mobiledocRelativeToAbsolute;
    mobiledocAbsoluteToTransformReady: typeof mobiledocAbsoluteToTransformReady;
    mobiledocRelativeToTransformReady: typeof mobiledocRelativeToTransformReady;
    mobiledocToTransformReady: typeof mobiledocToTransformReady;
    lexicalAbsoluteToRelative: typeof lexicalAbsoluteToRelative;
    lexicalRelativeToAbsolute: typeof lexicalRelativeToAbsolute;
    lexicalAbsoluteToTransformReady: typeof lexicalAbsoluteToTransformReady;
    lexicalRelativeToTransformReady: typeof lexicalRelativeToTransformReady;
    lexicalToTransformReady: typeof lexicalToTransformReady;
    plaintextAbsoluteToTransformReady: typeof plaintextAbsoluteToTransformReady;
    plaintextRelativeToTransformReady: typeof plaintextRelativeToTransformReady;
    plaintextToTransformReady: typeof plaintextToTransformReady;
    relativeToAbsolute: typeof relativeToAbsolute;
    relativeToTransformReady: typeof relativeToTransformReady;
    replacePermalink: typeof replacePermalink;
    stripSubdirectoryFromPath: typeof stripSubdirectoryFromPath;
    toTransformReady: typeof toTransformReady;
    transformReadyToAbsolute: typeof transformReadyToAbsolute;
    transformReadyToRelative: typeof transformReadyToRelative;
    urlJoin: typeof urlJoin;
};

const utils: Utils = {
    absoluteToRelative,
    absoluteToTransformReady,
    deduplicateDoubleSlashes,
    deduplicateSubdirectory,
    htmlAbsoluteToRelative,
    htmlRelativeToAbsolute,
    htmlAbsoluteToTransformReady,
    htmlRelativeToTransformReady,
    htmlToTransformReady,
    isSSL,
    markdownAbsoluteToRelative,
    markdownRelativeToAbsolute,
    markdownAbsoluteToTransformReady,
    markdownRelativeToTransformReady,
    markdownToTransformReady,
    mobiledocAbsoluteToRelative,
    mobiledocRelativeToAbsolute,
    mobiledocAbsoluteToTransformReady,
    mobiledocRelativeToTransformReady,
    mobiledocToTransformReady,
    lexicalAbsoluteToRelative,
    lexicalRelativeToAbsolute,
    lexicalAbsoluteToTransformReady,
    lexicalRelativeToTransformReady,
    lexicalToTransformReady,
    plaintextAbsoluteToTransformReady,
    plaintextRelativeToTransformReady,
    plaintextToTransformReady,
    relativeToAbsolute,
    relativeToTransformReady,
    replacePermalink,
    stripSubdirectoryFromPath,
    toTransformReady,
    transformReadyToAbsolute,
    transformReadyToRelative,
    urlJoin
};

export default utils;
module.exports = utils;
