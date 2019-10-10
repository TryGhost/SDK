const remark = require('remark');
const visit = require('unist-util-visit');
const htmlRelativeToAbsolute = require('./html-relative-to-absolute');
const relativeToAbsolute = require('./relative-to-absolute');

function markdownRelativeToAbsolute(markdown = '', siteUrl, itemPath, _options = {}) {
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
                new: htmlRelativeToAbsolute(node.value, siteUrl, itemPath, urlOptions),
                start: node.position.start.offset,
                end: node.position.end.offset
            });
        }

        if (node.type === 'link' || node.type === 'image') {
            replacements.push({
                old: node.url,
                new: relativeToAbsolute(node.url, siteUrl, itemPath, urlOptions),
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
        let after = result.slice(replacement.end + offsetAdjustment, markdown.length);

        result = before + transformed + after;

        offsetAdjustment = offsetAdjustment + (transformed.length - original.length);
    });

    return result;
}

module.exports = markdownRelativeToAbsolute;
