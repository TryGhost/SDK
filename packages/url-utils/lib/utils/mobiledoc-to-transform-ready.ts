import mobiledocRelativeToAbsolute = require('./mobiledoc-relative-to-absolute');
import mobiledocAbsoluteToTransformReady = require('./mobiledoc-absolute-to-transform-ready');

interface MobiledocToTransformReadyOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    cardTransformers?: any[];
}

function mobiledocToTransformReady(mobiledoc: string, siteUrl: string, itemPath?: string | MobiledocToTransformReadyOptions | null, options?: MobiledocToTransformReadyOptions): string {
    let actualItemPath: string | null = null;
    let actualOptions: MobiledocToTransformReadyOptions | undefined = options;

    if (typeof itemPath === 'object' && itemPath !== null && !options) {
        actualOptions = itemPath;
    } else if (typeof itemPath === 'string') {
        actualItemPath = itemPath;
    }

    const absolute = mobiledocRelativeToAbsolute(mobiledoc, siteUrl, actualItemPath, actualOptions);
    return mobiledocAbsoluteToTransformReady(absolute, siteUrl, actualOptions);
}

export = mobiledocToTransformReady;
