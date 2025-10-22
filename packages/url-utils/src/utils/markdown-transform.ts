import remarkDefault from 'remark';
import footnotes from 'remark-footnotes';
import visit from 'unist-util-visit';
import type {Node} from 'unist';
import type {MarkdownTransformOptions, MarkdownTransformOptionsInput} from './types';

const remark = remarkDefault;

interface MarkdownTransformFunctions {
    html: (value: string, siteUrl: string, itemPath: string | null, options: MarkdownTransformOptions) => string;
    url: (value: string, siteUrl: string, itemPath: string | null, options: MarkdownTransformOptions) => string;
}

interface MarkdownReplacement {
    old: string;
    new: string;
    start: number;
    end: number;
}

type RemarkNode = {
    type?: string;
    value?: string;
    url?: string;
    position?: {
        start?: {offset?: number; line?: number; column?: number};
        end?: {offset?: number; line?: number; column?: number};
    };
};

function replaceLast(find: string, replace: string, str: string): string {
    const lastIndex = str.lastIndexOf(find);

    if (lastIndex === -1) {
        return str;
    }

    const begin = str.substring(0, lastIndex);
    const end = str.substring(lastIndex + find.length);

    return begin + replace + end;
}

function markdownTransform(
    markdown: string = '',
    siteUrl: string,
    transformFunctions: MarkdownTransformFunctions,
    itemPath: string | null = null,
    _options: MarkdownTransformOptionsInput = {}
): string {
    const defaultOptions: MarkdownTransformOptions = {assetsOnly: false, ignoreProtocol: true};
    const options: MarkdownTransformOptions = {
        ...defaultOptions,
        ..._options
    };

    if (!markdown || (options.earlyExitMatchStr && !markdown.match(new RegExp(options.earlyExitMatchStr)))) {
        return markdown;
    }

    const replacements: MarkdownReplacement[] = [];

    const tree = remark()
        .use({settings: {commonmark: true}})
        .use(footnotes, {inlineNotes: true})
        .parse(markdown);

    visit(tree, ['link', 'image', 'html'], (node) => {
        const remarkNode = node as RemarkNode;
        const startOffset = remarkNode.position?.start?.offset;
        const endOffset = remarkNode.position?.end?.offset;

        if (remarkNode.type === 'html' && typeof remarkNode.value === 'string' && /src|srcset|href/.test(remarkNode.value) && typeof startOffset === 'number' && typeof endOffset === 'number') {
            const oldValue = remarkNode.value;
            const newValue = transformFunctions.html(oldValue, siteUrl, itemPath, options);

            if (newValue !== oldValue) {
                replacements.push({
                    old: oldValue,
                    new: newValue,
                    start: startOffset,
                    end: endOffset
                });
            }
        }

        if ((remarkNode.type === 'link' || remarkNode.type === 'image') && typeof remarkNode.url === 'string' && typeof startOffset === 'number' && typeof endOffset === 'number') {
            const oldValue = remarkNode.url;
            const newValue = transformFunctions.url(oldValue, siteUrl, itemPath, options);

            if (newValue !== oldValue) {
                replacements.push({
                    old: oldValue,
                    new: newValue,
                    start: startOffset,
                    end: endOffset
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
