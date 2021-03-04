const cheerio = require('cheerio');

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function extractSrcsetUrls(srcset = '') {
    return srcset.split(',').map((part) => {
        return part.trim().split(/\s+/)[0];
    });
}

function htmlTransform(html = '', siteUrl, transformFunction, itemPath, _options) {
    const defaultOptions = {assetsOnly: false, secure: false};
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
    const replacements = {};

    function addReplacement(replacement) {
        const key = `${replacement.name}="${replacement.originalValue}"`;

        if (!replacements[key]) {
            replacements[key] = [];
        }

        replacements[key].push(replacement);
    }

    // find all of the relative url attributes that we care about
    ['href', 'src', 'srcset'].forEach((attributeName) => {
        htmlContent('[' + attributeName + ']').each((ix, el) => {
            // ignore <stream> elems and html inside of <code> elements
            if (el.name === 'stream' || htmlContent(el).closest('code').length) {
                addReplacement({
                    name: attributeName,
                    originalValue: htmlContent(el).attr(attributeName),
                    skip: true
                });
                return;
            }

            el = htmlContent(el);
            const originalValue = el.attr(attributeName);

            if (attributeName === 'srcset') {
                const urls = extractSrcsetUrls(originalValue);
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

        attrs.forEach(({skip, name, originalValue, transformedValue}) => {
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

module.exports = htmlTransform;
