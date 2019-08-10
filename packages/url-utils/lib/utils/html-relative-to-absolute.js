const {URL} = require('url');
const cheerio = require('cheerio');
const urlJoin = require('./url-join');

function htmlRelativeToAbsolute(html, siteUrl, itemUrl, options = {assetsOnly: false}) {
    html = html || '';
    const htmlContent = cheerio.load(html, {decodeEntities: false});
    const staticImageUrlPrefixRegex = new RegExp(options.staticImageUrlPrefix);

    // convert relative resource urls to absolute
    ['href', 'src'].forEach((attributeName) => {
        htmlContent('[' + attributeName + ']').each((ix, el) => {
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
            if (attributeValue[0] === '#') {
                return;
            }

            if (options.assetsOnly && !attributeValue.match(staticImageUrlPrefixRegex)) {
                return;
            }

            // compose an absolute URL
            // if the relative URL begins with a '/' use the blog URL (including sub-directory)
            // as the base URL, otherwise use the post's URL.
            const baseUrl = attributeValue[0] === '/' ? siteUrl : itemUrl;
            attributeValue = urlJoin([baseUrl, attributeValue], {rootUrl: siteUrl});
            el.attr(attributeName, attributeValue);
        });
    });

    return htmlContent;
}

module.exports = htmlRelativeToAbsolute;
