import type {HtmlTransformOptionsInput, SecureOptionsInput} from './types';
import htmlTransform, {earlyExitMatchStr} from './html-transform';
import relativeToAbsolute from './relative-to-absolute';

function htmlRelativeToAbsolute(
    html: string = '',
    siteUrl: string,
    itemPath: string | null,
    _options: SecureOptionsInput = {}
): string {
    const defaultOptions: SecureOptionsInput = {assetsOnly: false, secure: false};
    const options: HtmlTransformOptionsInput = Object.assign({}, defaultOptions, _options || {});

    options.earlyExitMatchStr = earlyExitMatchStr;
    if (options.assetsOnly) {
        options.earlyExitMatchStr = options.staticImageUrlPrefix;
    }

    return htmlTransform(html, siteUrl, relativeToAbsolute, itemPath, options);
}

export default htmlRelativeToAbsolute;
