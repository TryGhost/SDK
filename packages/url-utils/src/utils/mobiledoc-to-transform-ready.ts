import type {MobiledocTransformOptionsInput} from './types';
import mobiledocRelativeToAbsolute from './mobiledoc-relative-to-absolute';
import mobiledocAbsoluteToTransformReady from './mobiledoc-absolute-to-transform-ready';

function mobiledocToTransformReady(
    mobiledoc: string,
    siteUrl: string,
    itemPath: string | null | MobiledocTransformOptionsInput,
    options?: MobiledocTransformOptionsInput
): string {
    let finalItemPath: string | null = null;
    let finalOptions: MobiledocTransformOptionsInput = options || {};

    if (typeof itemPath === 'object' && itemPath !== null && !options) {
        finalOptions = itemPath;
        finalItemPath = null;
    } else if (typeof itemPath === 'string') {
        finalItemPath = itemPath;
    }

    const absolute = mobiledocRelativeToAbsolute(mobiledoc, siteUrl, finalItemPath, finalOptions);
    return mobiledocAbsoluteToTransformReady(absolute, siteUrl, finalOptions);
}

export default mobiledocToTransformReady;
