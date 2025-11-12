import * as cheerio from 'cheerio';

type TransformFunction = (url: string, siteUrl: string, itemPath: string, options: HtmlTransformOptions) => string;

interface HtmlTransformOptions {
    assetsOnly?: boolean;
    secure?: boolean;
    earlyExitMatchStr?: string;
}

interface Replacement {
    name: string;
    originalValue: string;
    transformedValue?: string;
    skip?: boolean;
}

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
    transformFunction: TransformFunction,
    itemPath: string,
    _options: HtmlTransformOptions = {}
): string {
    const defaultOptions: Required<Pick<HtmlTransformOptions, 'assetsOnly' | 'secure'>> = {assetsOnly: false, secure: false};
    const options = Object.assign({}, defaultOptions, _options || {});

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
    const replacements: Record<string, Replacement[]> = {};

    function addReplacement(replacement: Replacement): void {
        const key = `${replacement.name}="${replacement.originalValue}"`;

        if (!replacements[key]) {
            replacements[key] = [];
        }

        replacements[key].push(replacement);
    }

    // find all of the relative url attributes that we care about
    (['href', 'src', 'srcset', 'style'] as const).forEach((attributeName) => {
        htmlContent('[' + attributeName + ']').each((_ix, el) => {
            const $el = htmlContent(el);
            // ignore <stream> elems and html inside of <code> elements
            if ((el as any).name === 'stream' || $el.closest('code').length) {
                const attrValue = $el.attr(attributeName);
                if (attrValue) {
                    addReplacement({
                        name: attributeName,
                        originalValue: attrValue,
                        skip: true
                    });
                }
                return;
            }

            const originalValue = $el.attr(attributeName);
            if (!originalValue) {
                return;
            }

            if (attributeName === 'srcset' || attributeName === 'style') {
                let urls: string[];

                if (attributeName === 'srcset') {
                    urls = extractSrcsetUrls(originalValue);
                } else {
                    urls = extractStyleUrls(originalValue);
                }
                const absoluteUrls = urls.map(url => transformFunction(url, siteUrl, itemPath, options));
                let transformedValue = originalValue;

                urls.forEach((url, i) => {
                    if (absoluteUrls[i]) {
                        let regex = new RegExp(escapeRegExp(url), 'g');
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

        attrs.forEach(({skip, name, originalValue, transformedValue}: Replacement) => {
            if (skip) {
                skipCount += 1;
                return;
            }

            // this regex avoids matching unrelated plain text by checking that the attribute/value pair
            // is surrounded by <> - that should be sufficient because if the plain text had that wrapper
            // it would be parsed as a tag
            // eslint-disable-next-line no-useless-escape
            const regex = new RegExp(`<[a-zA-Z][^>]*?(${name}=['"](${escapeRegExp(originalValue)})['"]).*?>`, 'gs');

            let matchCount = 0;
            html = html.replace(regex, (match, p1) => {
                let result = match;
                if (matchCount === skipCount && transformedValue) {
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
module.exports = htmlTransform;
