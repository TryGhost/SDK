import type {HtmlTransformOptionsInput, SecureOptionsInput} from './types';
import htmlTransform from './html-transform';
import relativeToAbsolute from './relative-to-absolute';

function htmlRelativeToAbsolute(
    html: string = '',
    siteUrl: string,
    itemPath: string | null,
    _options: SecureOptionsInput = {}
): string {
    const defaultOptions: SecureOptionsInput = {assetsOnly: false, secure: false};
    const options: HtmlTransformOptionsInput = Object.assign({}, defaultOptions, _options || {});

    // exit early and avoid parsing if the content does not contain an attribute we might transform
    options.earlyExitMatchStr = 'href=|src=|srcset=';
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    return htmlTransform(html, siteUrl, relativeToAbsolute, itemPath, options);
}

export default htmlRelativeToAbsolute;
