const unified = require('unified');
const parseMarkdown = require('remark-parse');
const stringifyMarkdown = require('remark-stringify');
const visit = require('unist-util-visit');
const urlJoin = require('./url-join');
const htmlRelativeToAbsolute = require('./html-relative-to-absolute');

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

function relativeLinksAndImages(options) {
    function visitor(node) {
        const absoluteUrl = relativeToAbsolute(node.url, options.siteUrl, options.itemPath, options);
        if (absoluteUrl) {
            node.url = absoluteUrl;
        }
    }

    function transform(tree) {
        visit(tree, ['link', 'image'], visitor);
    }

    return transform;
}

function relativeHtml(options) {
    function visitor(node) {
        if (node.value.match(/src|srcset|href/)) {
            node.value = htmlRelativeToAbsolute(node.value, options.siteUrl, options.itemUrl, options);
        }
    }

    function transform(tree) {
        visit(tree, ['html'], visitor);
    }

    return transform;
}

function markdownRelativeToAbsolute(markdown = '', siteUrl, itemPath, _options) {
    const defaultOptions = {assetsOnly: false, secure: false};
    const options = Object.assign({siteUrl, itemPath}, defaultOptions, _options || {});

    const processor = unified()
        .use(parseMarkdown, {commonmark: true, footnotes: true})
        .use(relativeLinksAndImages, options)
        .use(relativeHtml, options)
        .use(stringifyMarkdown, {commonmark: true, footnotes: true});

    let result = processor.processSync(markdown).toString();

    // re-add leading/trailing whitespace because remark trims output
    const [leadingWhitespace] = markdown.match(/^\s+/) || [];
    const [trailingWhitespace] = markdown.match(/\s+$/) || [];
    result = `${leadingWhitespace || ''}${result.trim()}${trailingWhitespace || ''}`;

    return result;
}

module.exports = markdownRelativeToAbsolute;
