const {URL} = require('url');
const cheerio = require('cheerio');
const urlJoin = require('./url-join');

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// TODO: use our relativeToAbsolute util function?
function relativeToAbsolute(url, siteUrl, itemPath, options) {
    const staticImageUrlPrefixRegex = new RegExp(options.staticImageUrlPrefix);

    // if URL is absolute move on to the next element
    try {
        const parsed = new URL(url, 'http://relative');

        if (parsed.origin !== 'http://relative') {
            return;
        }

        // Do not convert protocol relative URLs
        if (url.lastIndexOf('//', 0) === 0) {
            return;
        }
    } catch (e) {
        return;
    }

    // CASE: don't convert internal links
    if (url.startsWith('#')) {
        return;
    }

    if (options.assetsOnly && !url.match(staticImageUrlPrefixRegex)) {
        return;
    }

    // compose an absolute URL
    // if the relative URL begins with a '/' use the blog URL (including sub-directory)
    // as the base URL, otherwise use the post's URL.
    const baseUrl = url[0] === '/' ? siteUrl : itemPath;
    const absoluteUrl = new URL(urlJoin([baseUrl, url], {rootUrl: siteUrl}), siteUrl);

    if (options.secure) {
        absoluteUrl.protocol = 'https:';
    }

    return absoluteUrl.toString();
}

function extractSrcsetUrls(srcset = '') {
    return srcset.split(',').map((part) => {
        return part.trim().split(/\s+/)[0];
    });
}

function htmlRelativeToAbsolute(html = '', siteUrl, itemPath, _options) {
    const defaultOptions = {assetsOnly: false, secure: false};
    const options = Object.assign({}, defaultOptions, _options || {});

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
            const originalValue = el.attr(attributeName);

            if (attributeName === 'srcset') {
                const urls = extractSrcsetUrls(originalValue);
                const absoluteUrls = urls.map(url => relativeToAbsolute(url, siteUrl, itemPath, options));
                let absoluteValue = originalValue;

                urls.forEach((url, i) => {
                    if (absoluteUrls[i]) {
                        let regex = new RegExp(escapeRegExp(url), 'g');
                        absoluteValue = absoluteValue.replace(regex, absoluteUrls[i]);
                    }
                });

                if (absoluteValue !== originalValue) {
                    addReplacement({
                        name: attributeName,
                        originalValue,
                        absoluteValue
                    });
                }
            } else {
                const absoluteValue = relativeToAbsolute(originalValue, siteUrl, itemPath, options);

                if (absoluteValue) {
                    addReplacement({
                        name: attributeName,
                        originalValue,
                        absoluteValue
                    });
                }
            }
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
