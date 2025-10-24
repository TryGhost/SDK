import htmlTransform from './html-transform';
import type {HtmlTransformOptions} from './types';
import relativeToTransformReady, {type RelativeToTransformReadyOptionsInput} from './relative-to-transform-ready';

export interface HtmlRelativeToTransformReadyOptions extends HtmlTransformOptions {
    replacementStr: string;
}

export type HtmlRelativeToTransformReadyOptionsInput = RelativeToTransformReadyOptionsInput & Partial<HtmlRelativeToTransformReadyOptions>;

const htmlRelativeToTransformReady = function (
    html: string = '',
    root: string,
    itemPath?: string | HtmlRelativeToTransformReadyOptionsInput | null,
    _options?: HtmlRelativeToTransformReadyOptionsInput
): string {
    let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
    let resolvedOptions: HtmlRelativeToTransformReadyOptionsInput | undefined = _options;

    if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
        resolvedOptions = itemPath;
    }

    const options: HtmlRelativeToTransformReadyOptions = {
        assetsOnly: false,
        secure: false,
        replacementStr: '__GHOST_URL__',
        ...resolvedOptions
    };

    // exit early and avoid parsing if the content does not contain an attribute we might transform
    options.earlyExitMatchStr = 'href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix ?? 'content/images';
    }

    return htmlTransform(html, root, relativeToTransformReady, resolvedItemPath, options);
};

export default htmlRelativeToTransformReady;
