const remark = require('remark');
const visit = require('unist-util-visit');
const absoluteToRelative = require('./absolute-to-relative');
const htmlAbsoluteToRelative = require('./html-absolute-to-relative');

function markdownAbsoluteToRelative(markdown = '', siteUrl, _options = {}) {
    const defaultOptions = {assetsOnly: false, ignoreProtocol: true};
    const urlOptions = Object.assign({}, defaultOptions, _options);

    const replacements = [];

    // exit early and avoid parsing if the content does not contain the siteUrl
    let urlMatchStr = urlOptions.ignoreProtocol ? siteUrl.replace(/http:|https:/, '') : siteUrl;
    urlMatchStr = urlMatchStr.replace(/\/$/, '');
    if (!markdown || !markdown.match(new RegExp(urlMatchStr))) {
        return markdown;
    }

    const tree = remark()
        .use({settings: {commonmark: true, footnotes: true}})
        .parse(markdown);

    visit(tree, ['link', 'image', 'html'], (node) => {
        if (node.type === 'html' && node.value.match(/src|srcset|href/)) {
            const oldValue = node.value;
            const newValue = htmlAbsoluteToRelative(node.value, siteUrl, urlOptions);

            if (newValue !== oldValue) {
                replacements.push({
                    old: oldValue,
                    new: newValue,
                    start: node.position.start.offset,
                    end: node.position.end.offset
                });
            }
        }

        if (node.type === 'link' || node.type === 'image') {
            const oldValue = node.url;
            const newValue = absoluteToRelative(node.url, siteUrl, urlOptions);

            if (newValue !== oldValue) {
                replacements.push({
                    old: oldValue,
                    new: newValue,
                    start: node.position.start.offset,
                    end: node.position.end.offset
                });
            }
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

module.exports = markdownAbsoluteToRelative;
