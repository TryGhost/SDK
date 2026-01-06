import type {HtmlTransformOptions, HtmlTransformOptionsInput, UrlTransformFunction} from './types';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cheerio = require('cheerio');

export const transformAttributes = [
    'href',
    'src',
    'srcset',
    'style',
    'data-kg-background-image',
    'data-kg-custom-thumbnail',
    'data-kg-thumbnail'
];
export const earlyExitMatchStr = transformAttributes
    .map(attr => `${attr}=`)
    .join('|');

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSrcsetUrls(srcset: string = ''): string[] {
    return srcset.split(',').map((part) => {
        return part.trim().split(/\s+/)[0];
    });
}

function extractStyleUrls(style: string = ''): string[] {
    const urls: string[] = [];
    const regex = /url\(['|"]([^)]+)['|"]\)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(style)) !== null) {
        urls.push(match[1]);
    }

    return urls;
}

function htmlTransform(
    html: string = '',
    siteUrl: string,
    transformFunction: UrlTransformFunction,
    itemPath: string | null,
    _options: HtmlTransformOptionsInput = {}
): string {
    const defaultOptions: HtmlTransformOptions = {
        assetsOnly: false,
        secure: false
    };
    const options: HtmlTransformOptions = Object.assign({}, defaultOptions, _options || {});

    if (!html || (options.earlyExitMatchStr && !html.match(new RegExp(options.earlyExitMatchStr)))) {
        return html;
    }

    const htmlContent = cheerio.load(html, {decodeEntities: false});

    // replacements is keyed with the attr name + original relative value so
    // that we can implement skips for untouchable urls
    //
    // replacements = {
    //     'href="/test"': [
    //         {name: 'href', originalValue: '/test', absoluteValue: '.../test'},
    //         {name: 'href', originalValue: '/test', skip: true}, // found inside a <code> element
    //         {name: 'href', originalValue: '/test', absoluteValue: '.../test'},
    //     ]
    // }
    interface Replacement {
        name: string;
        originalValue: string;
        transformedValue?: string;
        skip?: boolean;
    }
    const replacements: Record<string, Replacement[]> = {};

    function addReplacement(replacement: Replacement): void {
        const key = `${replacement.name}="${replacement.originalValue}"`;

        if (!replacements[key]) {
            replacements[key] = [];
        }

        replacements[key].push(replacement);
    }

    transformAttributes.forEach((attributeName: string) => {
        htmlContent('[' + attributeName + ']').each((ix: number, el: cheerio.Element) => {
            // ignore <stream> elems and html inside of <code> elements
            const elementName = 'name' in el ? el.name : null;
            if (elementName === 'stream' || htmlContent(el).closest('code').length) {
                addReplacement({
                    name: attributeName,
                    originalValue: htmlContent(el).attr(attributeName),
                    skip: true
                });
                return;
            }

            const elWrapper = htmlContent(el);
            const originalValue = elWrapper.attr(attributeName);

            if (attributeName === 'srcset' || attributeName === 'style') {
                let urls: string[];

                if (attributeName === 'srcset') {
                    urls = extractSrcsetUrls(originalValue);
                } else {
                    urls = extractStyleUrls(originalValue);
                }
                const absoluteUrls = urls.map((url: string) => transformFunction(url, siteUrl, itemPath, options));
                let transformedValue = originalValue;

                urls.forEach((url: string, i: number) => {
                    if (absoluteUrls[i]) {
                        const regex = new RegExp(escapeRegExp(url), 'g');
                        transformedValue = transformedValue.replace(regex, absoluteUrls[i]);
                    }
                });

                if (transformedValue !== originalValue) {
                    addReplacement({
                        name: attributeName,
                        originalValue,
                        transformedValue
                    });
                }
            } else {
                const transformedValue = transformFunction(originalValue, siteUrl, itemPath, options);

                if (transformedValue !== originalValue) {
                    addReplacement({
                        name: attributeName,
                        originalValue,
                        transformedValue
                    });
                }
            }
        });
    });

    // Loop over all replacements and use a regex to replace urls in the original html string.
    // Allows indentation and formatting to be kept compared to using DOM manipulation and render
    for (const [, attrs] of Object.entries(replacements)) {
        let skipCount = 0;

        attrs.forEach(({skip, name, originalValue, transformedValue}) => {
            if (skip) {
                skipCount += 1;
                return;
            }

            // transformedValue is guaranteed to exist here because we only add replacements
            // when transformedValue !== originalValue, and we've already skipped entries with skip: true
            if (!transformedValue) {
                return;
            }

            // this regex avoids matching unrelated plain text by checking that the attribute/value pair
            // is surrounded by <> - that should be sufficient because if the plain text had that wrapper
            // it would be parsed as a tag
            // eslint-disable-next-line no-useless-escape
            const regex = new RegExp(`<[a-zA-Z][^>]*?(${name}=['"](${escapeRegExp(originalValue)})['"]).*?>`, 'gs');

            let matchCount = 0;
            html = html.replace(regex, (match: string, p1: string): string => {
                let result = match;
                if (matchCount === skipCount) {
                    result = match.replace(p1, p1.replace(originalValue, transformedValue));
                }
                matchCount += 1;
                return result;
            });
        });
    }

    return html;
}

export default htmlTransform;
