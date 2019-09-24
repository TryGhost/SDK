const {URL} = require('url');
const cheerio = require('cheerio');
const urlJoin = require('./url-join');

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function htmlRelativeToAbsolute(html = '', siteUrl, itemUrl, _options) {
    const defaultOptions = {assetsOnly: false, secure: false};
    const options = Object.assign({}, defaultOptions, _options || {});

    const htmlContent = cheerio.load(html, {decodeEntities: false});
    const staticImageUrlPrefixRegex = new RegExp(options.staticImageUrlPrefix);

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
    ['href', 'src'].forEach((attributeName) => {
        htmlContent('[' + attributeName + ']').each((ix, el) => {
            // ignore html inside of <code> elements
            if (htmlContent(el).closest('code').length) {
                addReplacement({
                    name: attributeName,
                    originalValue: htmlContent(el).attr(attributeName),
                    skip: true
                });
                return;
            }

            el = htmlContent(el);

            let attributeValue = el.attr(attributeName);

            // if URL is absolute move on to the next element
            try {
                const parsed = new URL(attributeValue, 'http://relative');

                if (parsed.origin !== 'http://relative') {
                    return;
                }

                // Do not convert protocol relative URLs
                if (attributeValue.lastIndexOf('//', 0) === 0) {
                    return;
                }
            } catch (e) {
                return;
            }

            // CASE: don't convert internal links
            if (attributeValue.startsWith('#')) {
                return;
            }

            if (options.assetsOnly && !attributeValue.match(staticImageUrlPrefixRegex)) {
                return;
            }

            // compose an absolute URL
            // if the relative URL begins with a '/' use the blog URL (including sub-directory)
            // as the base URL, otherwise use the post's URL.
            const baseUrl = attributeValue[0] === '/' ? siteUrl : itemUrl;
            const absoluteUrl = new URL(urlJoin([baseUrl, attributeValue], {rootUrl: siteUrl}));

            if (options.secure) {
                absoluteUrl.protocol = 'https:';
            }

            addReplacement({
                name: attributeName,
                originalValue: attributeValue,
                absoluteValue: absoluteUrl.toString()
            });
        });
    });

    // Loop over all replacements and use a regex to replace urls in the original html string.
    // Allows indentation and formatting to be kept compared to using DOM manipulation and render
    for (const [, attrs] of Object.entries(replacements)) {
        let skipCount = 0;

        attrs.forEach((attr) => {
            if (attr.skip) {
                skipCount += 1;
                return;
            }

            const regex = new RegExp(`${attr.name}=['"](${escapeRegExp(attr.originalValue)})['"]`, 'g');
            let matchCount = 0;
            html = html.replace(regex, (match) => {
                let result = match;
                if (matchCount === skipCount) {
                    result = match.replace(attr.originalValue, attr.absoluteValue);
                }
                matchCount += 1;
                return result;
            });
        });
    }

    return html;
}

module.exports = htmlRelativeToAbsolute;
