import mobiledocRelativeToAbsolute from './mobiledoc-relative-to-absolute';
import mobiledocAbsoluteToTransformReady from './mobiledoc-absolute-to-transform-ready';

interface MobiledocToTransformReadyOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    cardTransformers?: any[];
}

function mobiledocToTransformReady(
    mobiledoc: string,
    siteUrl: string,
    itemPath?: string | MobiledocToTransformReadyOptions | null,
    options?: MobiledocToTransformReadyOptions
): string {
    let actualItemPath: string | null = null;
    let actualOptions: MobiledocToTransformReadyOptions;
    
    if (itemPath && typeof itemPath === 'object' && !options) {
        actualOptions = itemPath;
        actualItemPath = null;
    } else {
        actualOptions = options || {};
        actualItemPath = typeof itemPath === 'string' ? itemPath : null;
    }
    const absolute = mobiledocRelativeToAbsolute(mobiledoc, siteUrl, actualItemPath || '', actualOptions);
    return mobiledocAbsoluteToTransformReady(absolute, siteUrl, actualOptions);
}

export default mobiledocToTransformReady;
module.exports = mobiledocToTransformReady;
