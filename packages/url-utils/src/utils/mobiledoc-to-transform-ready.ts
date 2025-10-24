import mobiledocAbsoluteToTransformReady, {type MobiledocAbsoluteToTransformReadyOptions} from './mobiledoc-absolute-to-transform-ready';
import mobiledocRelativeToAbsolute, {type MobiledocRelativeToAbsoluteOptions} from './mobiledoc-relative-to-absolute';

export type MobiledocToTransformReadyOptions = MobiledocRelativeToAbsoluteOptions & MobiledocAbsoluteToTransformReadyOptions;

function mobiledocToTransformReady(
    mobiledoc: string,
    siteUrl: string,
    itemPath?: string | MobiledocToTransformReadyOptions | null,
    options?: MobiledocToTransformReadyOptions
): string {
    let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
    let resolvedOptions: MobiledocToTransformReadyOptions | undefined = options;

    if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
        resolvedOptions = itemPath;
    }

    const absolute = mobiledocRelativeToAbsolute(mobiledoc, siteUrl, resolvedItemPath, resolvedOptions);
    return mobiledocAbsoluteToTransformReady(absolute, siteUrl, resolvedOptions);
}

export default mobiledocToTransformReady;
