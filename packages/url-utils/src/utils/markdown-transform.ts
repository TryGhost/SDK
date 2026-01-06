import type {MarkdownTransformOptions, MarkdownTransformOptionsInput, MarkdownTransformFunctions} from './types';
/* eslint-disable @typescript-eslint/no-require-imports */
let remark: typeof import('remark') | undefined;
const footnotes = require('remark-footnotes');
const visit = require('unist-util-visit');
/* eslint-enable @typescript-eslint/no-require-imports */

function replaceLast(find: string, replace: string, str: string): string {
    const lastIndex = str.lastIndexOf(find);

    if (lastIndex === -1) {
        return str;
    }

    const begin = str.substring(0, lastIndex);
    const end = str.substring(lastIndex + find.length);

    return begin + replace + end;
}

interface Replacement {
    old: string;
    new: string;
    start: number;
    end: number;
}

function markdownTransform(
    markdown: string = '',
    siteUrl: string,
    transformFunctions: MarkdownTransformFunctions,
    itemPath: string | null,
    _options: MarkdownTransformOptionsInput = {}
): string {
    const defaultOptions: MarkdownTransformOptions = {assetsOnly: false, ignoreProtocol: true};
    const options: MarkdownTransformOptions = Object.assign({}, defaultOptions, _options);

    if (!markdown || (options.earlyExitMatchStr && !markdown.match(new RegExp(options.earlyExitMatchStr)))) {
        return markdown;
    }

    const replacements: Replacement[] = [];

    if (!remark) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        remark = require('remark');
    }

    if (!remark) {
        return markdown;
    }

    const tree = remark()
        .use({settings: {commonmark: true}})
        .use(footnotes, {inlineNotes: true})
        .parse(markdown);

    visit(tree, ['link', 'image', 'html'], (node: {type: string; value?: string; url?: string; position?: {start: {offset: number}; end: {offset: number}}}) => {
        if (node.type === 'html' && node.value && node.value.match(/src|srcset|href/) && node.position) {
            const oldValue = node.value;
            const newValue = transformFunctions.html(oldValue, siteUrl, itemPath, options);

            if (newValue !== oldValue) {
                replacements.push({
                    old: oldValue,
                    new: newValue,
                    start: node.position.start.offset,
                    end: node.position.end.offset
                });
            }
        }

        if ((node.type === 'link' || node.type === 'image') && node.url && node.position) {
            const oldValue = node.url;
            const newValue = transformFunctions.url(oldValue, siteUrl, itemPath, options);

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
    let nestedAdjustment = 0;

    replacements.forEach((replacement, i) => {
        const original = markdown.slice(replacement.start, replacement.end);
        // only transform last occurrence of the old string because markdown links and images
        // have urls at the end and we see replacements for outermost nested nodes first
        const transformed = replaceLast(replacement.old, replacement.new, original);

        let before = result.slice(0, replacement.start + offsetAdjustment);
        let after = result.slice(replacement.end + offsetAdjustment, result.length);

        result = before + transformed + after;

        // adjust offset according to new lengths
        const nextReplacement = replacements[i + 1];
        const adjustment = transformed.length - original.length;

        if (nextReplacement && nextReplacement.start < replacement.end) {
            // next replacement is nested, do not apply any offset adjustments until we're out of nesting
            nestedAdjustment = nestedAdjustment + adjustment;
        } else {
            offsetAdjustment = offsetAdjustment + adjustment + nestedAdjustment;
            nestedAdjustment = 0;
        }
    });

    return result;
}

export default markdownTransform;
