import htmlAbsoluteToTransformReady, {type HtmlAbsoluteToTransformReadyOptionsInput} from './html-absolute-to-transform-ready';
import htmlRelativeToAbsolute, {type HtmlRelativeToAbsoluteOptionsInput} from './html-relative-to-absolute';

export type HtmlToTransformReadyOptions = HtmlRelativeToAbsoluteOptionsInput & HtmlAbsoluteToTransformReadyOptionsInput;

function htmlToTransformReady(
    html: string,
    siteUrl: string,
    itemPath?: string | HtmlToTransformReadyOptions | null,
    options?: HtmlToTransformReadyOptions
): string {
    let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
    let resolvedOptions: HtmlToTransformReadyOptions | undefined = options;

    if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
        resolvedOptions = itemPath;
    }

    const absolute = htmlRelativeToAbsolute(html, siteUrl, resolvedItemPath, resolvedOptions);
    return htmlAbsoluteToTransformReady(absolute, siteUrl, resolvedOptions);
}

export default htmlToTransformReady;
