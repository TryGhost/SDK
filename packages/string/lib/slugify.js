const unidecode = require('unidecode');
const stripInvisibleChars = require('./stripInvisibleChars');

/**
 * Slugify
 *
 * Prepares a string for use in a url.
 *
 * @param {String} string - the string we want to slugify
 * @param {object} options - filter options
 * @param {bool} [options.requiredChangesOnly] - don't perform optional cleanup, e.g. removing extra dashes
 * @returns {String} slugified string
 */
module.exports = function (string, options = {}) {
    // Ensure we have a string
    string = string || '';

    // Strip all characters that cannot be printed
    string = stripInvisibleChars(string);

    // Handle the £ symbol separately, since it needs to be removed before the unicode conversion.
    string = string.replace(/£/g, '-');

    // Remove non ascii characters
    string = unidecode(string);

    // Replace URL reserved chars: `@:/?#[]!$&()*+,;=` as well as `\%<>|^~£"{}` and \`
    string = string.replace(/(\s|\.|@|:|\/|\?|#|\[|\]|!|\$|&|\(|\)|\*|\+|,|;|=|\\|%|<|>|\||\^|~|"|\{|\}|`|–|—)/g, '-')
    // Remove apostrophes
        .replace(/'/g, '')
        // Make the whole thing lowercase
        .toLowerCase();

    // These changes are optional changes, we can enable/disable these
    if (!options.requiredChangesOnly) {
        // Convert 2 or more dashes into a single dash
        string = string.replace(/-+/g, '-')
        // Remove trailing dash
            .replace(/-$/, '')
            // Remove any dashes at the beginning
            .replace(/^-/, '');
    }

    // Handle whitespace at the beginning or end.
    string = string.trim();

    return string;
};
