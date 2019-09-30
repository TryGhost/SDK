const unified = require('unified');
const parseMarkdown = require('remark-parse');
const stringifyMarkdown = require('remark-stringify');
const visit = require('unist-util-visit');
const absoluteToRelative = require('./absolute-to-relative');
const htmlAbsoluteToRelative = require('./html-absolute-to-relative');

function absoluteLinksAndImages(options) {
    function visitor(node) {
        node.url = absoluteToRelative(node.url, options.siteUrl, options);
    }

    return function transform(tree) {
        visit(tree, ['link', 'image'], visitor);
    };
}

function absoluteHtml(options) {
    function visitor(node) {
        if (node.value.match(/src|srcset|href/)) {
            node.value = htmlAbsoluteToRelative(node.value, options.siteUrl, options);
        }
    }

    return function transform(tree) {
        visit(tree, ['html'], visitor);
    };
}

function markdownAbsoluteToRelative(markdown = '', siteUrl, _options = {}) {
    const defaultOptions = {assetsOnly: false};
    const options = Object.assign({siteUrl}, defaultOptions, _options);

    const processor = unified()
        .use(parseMarkdown, {commonmark: true, footnotes: true})
        .use(absoluteLinksAndImages, options)
        .use(absoluteHtml, options)
        .use(stringifyMarkdown, {commonmark: true, footnotes: true});

    let result = processor.processSync(markdown).toString();

    // re-add leading/trailing whitespace because remark trims output
    const [leadingWhitespace] = markdown.match(/^\s+/) || [];
    const [trailingWhitespace] = markdown.match(/\s+$/) || [];
    result = `${leadingWhitespace || ''}${result.trim()}${trailingWhitespace || ''}`;

    return result;
}

module.exports = markdownAbsoluteToRelative;
