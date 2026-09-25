const anyAscii = require('any-ascii').default;
const stripInvisibleChars = require('./strip-invisible-chars');

/**
 * Slugify
 *
 * Prepares a string for use in a url.
 *
 * @param {String} string - the string we want to slugify
 * @param {object} options - filter options
 * @param {bool} [options.requiredChangesOnly] - don't perform optional cleanup, e.g. removing extra dashes
 * @param {bool} [options.unicodeSlugs] - don't perform optional transliteration, e.g. keep smörgåsbord as it is instead of turning it into smorgasbord
 * @param {string} [options.slugSeparator] - separator to be used for the slugs, can be ` `, `_` or `-`, defaults to `-`
 * @returns {String} slugified string
 */
module.exports = function (string, options = {}) {
    // If the separator is invalid or unset, replace it with the default `-`
    const separator = ['-', '_', ' '].includes(options.slugSeparator) ? options.slugSeparator : '-';

    // Ensure we have a string
    string = string || '';

    // Strip all characters that cannot be printed
    string = stripInvisibleChars(string)
    // Normalize the input to make sure accent marks, etc. are part of the characters before continuing
        .normalize('NFC')
        // Remove the most common forms of apostrophes, to turn contractions like "what’s" into "whats"
        .replace(/['‘’´]/g, '')
        // Remove anything that's not a letter, number or a separator
        .replace(/[^\p{L}\p{N}\p{Mn}\p{Mc}\s_-]/gu, separator)
        // Remove potential misuse of combining marks, like Zalgo text, by limiting the number of marks,
        // a limit of 3 marks should allow pretty much any natural language usage, so in case there's 4
        // marks or more, we remove all marks. Combining marks in the beginning of a word shouldn't
        // exist at all in natural language, so these are just removed.
        .replace(/([\p{L}\p{N}][\p{Mn}\p{Mc}]*)|[\p{Mn}\p{Mc}]+/gu, '$1')
        .replace(/([^\p{Mn}\p{Mc}])[\p{Mn}\p{Mc}]{4,}/gu, '$1');

    // Perform the transliteration if requested
    if (!options.unicodeSlugs) {
        string = anyAscii(string);
    }

    // Replace spaces, URL reserved chars: `@:/?#[]!$&()*+,;=` as well as `\%<>|^~£"{}-` and \` with the selected separator.
    // Should only be needed in case the transliteration added something, but it's safer to always run in case the regex filter missed something.
    string = string.replace(/(\s|\.|@|:|\/|\?|#|\[|\]|!|\$|&|\(|\)|\*|\+|,|;|=|\\|%|<|>|\||\^|~|£|"|\{|\}|`|–|—)/g, separator)
    // Remove apostrophes (again, in case the transliteration added some)
        .replace(/['‘’´]/g, '')
        // camelCase looking text after initial cleanup and transliteration are most likely separate words, so we add separators between the parts
        .replace(/([a-z])([A-Z])/g, `$1${separator}$2`)
        // Make the whole thing lowercase
        .toLowerCase();

    // These changes are optional changes, we can enable/disable these
    if (!options.requiredChangesOnly) {
        // Convert 2 or more separators into a single separator
        string = string.replace(/[\s_-]{2,}/g, separator)
        // Remove trailing separators
            .replace(/[\s_-]$/, '')
            // Remove any separators at the beginning
            .replace(/^[\s_-]/, '');
    } else {
        // Handle whitespace at the beginning or end.
        string = string.trim();
    }

    return string;
};
