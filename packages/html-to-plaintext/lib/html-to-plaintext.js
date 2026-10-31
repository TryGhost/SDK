const _ = require('lodash');

const mergeSettings = (extraSettings) => {
    return _.mergeWith({}, baseSettings, extraSettings, function customizer(objValue, srcValue) {
        if (_.isArray(objValue)) {
            return objValue.concat(srcValue);
        }
    });
};

// html-to-text 10's parser treats textarea and xmp as raw text, leaving entities encoded
const decodedRawText = (elem, walk, builder) => {
    const {decodeHTML} = require('entities');

    for (const child of elem.children) {
        if (child.type === 'text') {
            child.data = decodeHTML(child.data);
        }
    }
    walk(elem.children, builder);
};

const baseSettings = {
    wordwrap: false,
    preserveNewlines: true,

    // equiv returnDomByDefault: true,
    baseElements: {returnDomByDefault: true},
    formatters: {decodedRawText},
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
        {selector: 'div', format: 'inline'},

        // Backwards compatibility with html-to-text 8
        {selector: 'textarea', format: 'decodedRawText'},
        {selector: 'xmp', format: 'decodedRawText'}
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
        selectors: [
            // equiv hideLinkHrefIfSameAsText: true
            {selector: 'a', options: {hideLinkHrefIfSameAsText: true}},
            // Don't include html .preheader in email
            {selector: '.preheader', format: 'skip'},
            {selector: '.preheader-spacing', format: 'skip'}
        ]
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
        selectors: [
            // The top-level ignoreHref option leaks into html-to-text's shared defaults
            {selector: 'a', options: {ignoreHref: true}},
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
