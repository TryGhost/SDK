const unified = require('unified');
const parseMarkdown = require('remark-parse');
const stringifyMarkdown = require('remark-stringify');
const visit = require('unist-util-visit');
const htmlRelativeToAbsolute = require('./html-relative-to-absolute');
const relativeToAbsolute = require('./relative-to-absolute');

function relativeLinksAndImages(options) {
    function visitor(node) {
        node.url = relativeToAbsolute(node.url, options.siteUrl, options.itemPath, options);
    }

    return function transform(tree) {
        visit(tree, ['link', 'image'], visitor);
    };
}

function relativeHtml(options) {
    function visitor(node) {
        if (node.value.match(/src|srcset|href/)) {
            node.value = htmlRelativeToAbsolute(node.value, options.siteUrl, options.itemUrl, options);
        }
    }

    return function transform(tree) {
        visit(tree, ['html'], visitor);
    };
}

function markdownRelativeToAbsolute(markdown = '', siteUrl, itemPath, _options = {}) {
    const defaultOptions = {assetsOnly: false, secure: false};
    const options = Object.assign({siteUrl, itemPath}, defaultOptions, _options);

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
