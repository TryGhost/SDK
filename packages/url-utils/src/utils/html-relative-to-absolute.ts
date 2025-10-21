import htmlTransform from './html-transform';
import type {HtmlTransformOptions, HtmlTransformOptionsInput} from './types';
import relativeToAbsolute, {type RelativeToAbsoluteOptionsInput} from './relative-to-absolute';

export type HtmlRelativeToAbsoluteOptions = HtmlTransformOptions;
export type HtmlRelativeToAbsoluteOptionsInput = HtmlTransformOptionsInput & RelativeToAbsoluteOptionsInput;

function htmlRelativeToAbsolute(
    html: string = '',
    siteUrl: string,
    itemPath?: string | HtmlRelativeToAbsoluteOptionsInput | null,
    _options?: HtmlRelativeToAbsoluteOptionsInput
): string {
    let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
    let resolvedOptions: HtmlRelativeToAbsoluteOptionsInput | undefined = _options;

    if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
        resolvedOptions = itemPath;
    }

    const defaultOptions: HtmlRelativeToAbsoluteOptions = {assetsOnly: false, secure: false};
    const options: HtmlRelativeToAbsoluteOptions = {
        ...defaultOptions,
        ...resolvedOptions
    };

    // exit early and avoid parsing if the content does not contain an attribute we might transform
    options.earlyExitMatchStr = 'href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix ?? 'content/images';
    }

    return htmlTransform(html, siteUrl, relativeToAbsolute, resolvedItemPath, options);
}

export default htmlRelativeToAbsolute;
