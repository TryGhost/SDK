const remark = require('remark');
const visit = require('unist-util-visit');
const htmlRelativeToAbsolute = require('./html-relative-to-absolute');
const relativeToAbsolute = require('./relative-to-absolute');

function markdownRelativeToAbsolute(markdown = '', siteUrl, itemPath, _options = {}) {
    const defaultOptions = {assetsOnly: false};
    const urlOptions = Object.assign({}, defaultOptions, _options);

    // exit early and avoid parsing if the content does not contain an
    // attribute we might transform
    let attrMatchString = '\\]\\([^\\s\\)]|href=|src=|srcset=';
    if (urlOptions.assetsOnly) {
        attrMatchString = urlOptions.staticImageUrlPrefix;
    }
    if (!markdown || !markdown.match(new RegExp(attrMatchString))) {
        return markdown;
    }

    const replacements = [];

    const tree = remark()
        .use({settings: {commonmark: true, footnotes: true}})
        .parse(markdown);

    visit(tree, ['link', 'image', 'html'], (node) => {
        if (node.type === 'html' && node.value.match(/src|srcset|href/)) {
            const oldValue = node.value;
            const newValue = htmlRelativeToAbsolute(node.value, siteUrl, itemPath, urlOptions);

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
            const newValue = relativeToAbsolute(node.url, siteUrl, itemPath, urlOptions);

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
        let after = result.slice(replacement.end + offsetAdjustment, result.length);

        result = before + transformed + after;

        offsetAdjustment = offsetAdjustment + (transformed.length - original.length);
    });

    return result;
}

module.exports = markdownRelativeToAbsolute;
