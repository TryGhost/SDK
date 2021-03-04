const remark = require('remark');
const footnotes = require('remark-footnotes');
const visit = require('unist-util-visit');

function markdownTransform(markdown = '', siteUrl, transformFunctions, itemPath, _options = {}) {
    const defaultOptions = {assetsOnly: false, ignoreProtocol: true};
    const options = Object.assign({}, defaultOptions, _options);

    if (!markdown || (options.earlyExitMatchStr && !markdown.match(new RegExp(options.earlyExitMatchStr)))) {
        return markdown;
    }

    const replacements = [];

    const tree = remark()
        .use({settings: {commonmark: true}})
        .use(footnotes, {inlineNotes: true})
        .parse(markdown);

    visit(tree, ['link', 'image', 'html'], (node) => {
        if (node.type === 'html' && node.value.match(/src|srcset|href/)) {
            const oldValue = node.value;
            const newValue = transformFunctions.html(node.value, siteUrl, itemPath, options);

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
            const newValue = transformFunctions.url(node.url, siteUrl, itemPath, options);

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

module.exports = markdownTransform;
