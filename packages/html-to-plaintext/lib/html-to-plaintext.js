const _ = require('lodash');

const mergeSettings = (extraSettings) => {
    return _.mergeWith({}, baseSettings, extraSettings, function customizer(objValue, srcValue) {
        if (_.isArray(objValue)) {
            return objValue.concat(srcValue);
        }
    });
};

const baseSettings = {
    wordwrap: false,
    preserveNewlines: true,

    // equiv returnDomByDefault: true,
    baseElements: {returnDomByDefault: true},
    selectors: [
        // Ignore images, equiv ignoreImage: true
        {selector: 'img', format: 'skip'},

        // disable uppercase headings, equiv uppercaseHeadings: false
        {selector: 'h1', options: {uppercase: false}},
        {selector: 'h2', options: {uppercase: false}},
        {selector: 'h3', options: {uppercase: false}},
        {selector: 'h4', options: {uppercase: false}},
        {selector: 'h5', options: {uppercase: false}},
        {selector: 'h6', options: {uppercase: false}},
        {selector: 'table', options: {uppercaseHeaderCells: false}},

        // Backwards compatibility with html-to-text 5.1.1
        {selector: 'div', format: 'inline'}
    ]
};

let excerptConverter;
let emailConverter;
let commentConverter;
let commentSnippetConverter;

const loadConverters = () => {
    if (excerptConverter && emailConverter) {
        return;
    }

    const {compile} = require('html-to-text');

    const excerptSettings = mergeSettings({
        selectors: [
            {selector: 'a', options: {ignoreHref: true}},
            {selector: 'figcaption', format: 'skip'},
            // Strip inline and bottom footnotes
            {selector: 'a[rel=footnote]', format: 'skip'},
            {selector: 'div.footnotes', format: 'skip'},
            // Don't output hrs
            {selector: 'hr', format: 'skip'},
            // Don't output > in blockquotes
            {selector: 'blockquote', format: 'block'},
            // Don't include signup cards in excerpts
            {selector: '.kg-signup-card', format: 'skip'}
        ]
    });

    const emailSettings = mergeSettings({
        preserveNewlines: false,
        selectors: [
            // equiv hideLinkHrefIfSameAsText: true
            {selector: 'a', options: {hideLinkHrefIfSameAsText: true}},
            // Don't include html .preheader in email
            {selector: '.preheader', format: 'skip'},
            {selector: 'p', options: {leadingLineBreaks: 2, trailingLineBreaks: 1}},
            {selector: 'h1', format: 'customHeader'},
            {selector: 'h2', format: 'customHeader'},
            {selector: 'h3', format: 'customHeader'},
            {selector: 'h4', format: 'customHeader'},
            {selector: 'h5', options: {uppercase: false, leadingLineBreaks: 2, trailingLineBreaks: 1}},
            {selector: 'h6', options: {uppercase: false, leadingLineBreaks: 2, trailingLineBreaks: 1}}
        ],
        formatters: {
            customHeader: function (elem, walk, builder) {
                function extractText(element) {
                    if (element.type === 'text') {
                        return element.data;
                    }
                    if (element.children) {
                        return element.children.map(extractText).join('');
                    }
                    return '';
                }

                const text = extractText(elem).trim();
                // Early return if header is empty
                if (!text) {
                    return;
                }

                const tagName = elem.name.toLowerCase();
                const stars = '*'.repeat(text.length);
                const dashes = '-'.repeat(text.length);

                switch (tagName) {
                case 'h1':
                    builder.addLineBreak();
                    builder.addLineBreak();
                    builder.addInline(`${stars}`);
                    builder.addLineBreak();
                    builder.addInline(`${text}`);
                    builder.addLineBreak();
                    builder.addInline(`${stars}`);
                    builder.addLineBreak();
                    break;

                case 'h2':
                    builder.addLineBreak();
                    builder.addLineBreak();
                    builder.addInline(`${dashes}`);
                    builder.addLineBreak();
                    builder.addInline(`${text}`);
                    builder.addLineBreak();
                    builder.addInline(`${dashes}`);
                    builder.addLineBreak();
                    break;

                case 'h3':
                case 'h4':
                    builder.addLineBreak();
                    builder.addLineBreak();
                    builder.addInline(`${text}`);
                    builder.addLineBreak();
                    builder.addInline(`${dashes}`);
                    builder.addLineBreak();
                    break;
                }
            }
        }
    });

    const commentSettings = mergeSettings({
        preserveNewlines: false,
        selectors: [
            // equiv hideLinkHrefIfSameAsText: true
            {selector: 'a', options: {hideLinkHrefIfSameAsText: true}},
            // No space between <p> tags. An empty <p> is needed
            {selector: 'p', options: {leadingLineBreaks: 1, trailingLineBreaks: 1}}
        ]
    });

    const commentSnippetSettings = mergeSettings({
        preserveNewlines: false,
        ignoreHref: true,
        selectors: [
            {selector: 'blockquote', format: 'skip'}
        ]
    });

    excerptConverter = compile(excerptSettings);
    emailConverter = compile(emailSettings);
    commentConverter = compile(commentSettings);
    commentSnippetConverter = compile(commentSnippetSettings);
};

module.exports.excerpt = (html) => {
    loadConverters();

    return excerptConverter(html);
};

module.exports.email = (html) => {
    loadConverters();

    return emailConverter(html);
};

module.exports.comment = (html) => {
    loadConverters();

    return commentConverter(html);
};

module.exports.commentSnippet = (html) => {
    loadConverters();

    return commentSnippetConverter(html)
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ');
};
