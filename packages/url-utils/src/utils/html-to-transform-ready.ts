import type {HtmlTransformOptionsInput} from './types';
import htmlRelativeToAbsolute from './html-relative-to-absolute';
import htmlAbsoluteToTransformReady from './html-absolute-to-transform-ready';
import type {AbsoluteToTransformReadyOptionsInput} from './absolute-to-transform-ready';

function htmlToTransformReady(
    html: string,
    siteUrl: string,
    itemPath: string | null | HtmlTransformOptionsInput,
    options?: HtmlTransformOptionsInput
): string {
    let finalItemPath: string | null = null;
    let finalOptions: HtmlTransformOptionsInput = options || {};

    if (typeof itemPath === 'object' && itemPath !== null && !options) {
        finalOptions = itemPath;
        finalItemPath = null;
    } else if (typeof itemPath === 'string') {
        finalItemPath = itemPath;
    }
    const absolute = htmlRelativeToAbsolute(html, siteUrl, finalItemPath, finalOptions);
    return htmlAbsoluteToTransformReady(absolute, siteUrl, finalOptions as AbsoluteToTransformReadyOptionsInput);
}

export default htmlToTransformReady;
