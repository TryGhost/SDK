const remark = require('remark');
const visit = require('unist-util-visit');
const absoluteToRelative = require('./absolute-to-relative');
const htmlAbsoluteToRelative = require('./html-absolute-to-relative');

function markdownAbsoluteToRelative(markdown = '', siteUrl, _options = {}) {
    const defaultOptions = {assetsOnly: false};
    const urlOptions = Object.assign({}, defaultOptions, _options);

    const replacements = [];

    const tree = remark()
        .use({settings: {commonmark: true, footnotes: true}})
        .parse(markdown);

    visit(tree, ['link', 'image', 'html'], (node) => {
        if (node.type === 'html' && node.value.match(/src|srcset|href/)) {
            replacements.push({
                old: node.value,
                new: htmlAbsoluteToRelative(node.value, siteUrl, urlOptions),
                start: node.position.start.offset,
                end: node.position.end.offset
            });
        }

        if (node.type === 'link' || node.type === 'image') {
            replacements.push({
                old: node.url,
                new: absoluteToRelative(node.url, siteUrl, urlOptions),
                start: node.position.start.offset,
                end: node.position.end.offset
            });
        }
    });

    let result = markdown;
    let offsetAdjustment = 0;

    replacements.forEach((replacement) => {
        const original = markdown.slice(replacement.start, replacement.end);
        const transformed = original.replace(replacement.old, replacement.new);

        let before = result.slice(0, replacement.start + offsetAdjustment);
        let after = result.slice(replacement.end + offsetAdjustment, markdown.length - 1);

        result = before + transformed + after;

        offsetAdjustment = offsetAdjustment + (transformed.length - original.length);
    });

    return result;
}

module.exports = markdownAbsoluteToRelative;
