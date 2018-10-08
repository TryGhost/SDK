const _ = require('lodash');
const visibility = require('./utils/visibility');
/**
 * Tags Helper
 *
 * @param {object} data - the data we are filtering
 * @param {object} options - filter options
 */

module.exports = (data, options) => {
    let output = '';
    let separator = _.isString(options.separator) ? options.separator : ', ';
    let prefix = _.isString(options.prefix) ? options.prefix : '';
    let suffix = _.isString(options.suffix) ? options.suffix : '';
    let limit = options.limit ? parseInt(options.limit, 10) : undefined;
    let from = options.from ? parseInt(options.from, 10) : 1;
    let to = options.to ? parseInt(options.to, 10) : undefined;
    let visibilityArr = visibility.parse(options.visibility);
    let explicit = options.explict || !!options.visibility;

    if (data.tags && data.tags.length) {
        output = visibility.filter(data.tags, visibilityArr, explicit, options.fn);
        from -= 1; // From uses 1-indexed, but array uses 0-indexed.
        to = to || limit + from || output.length;
        output = output.slice(from, to).join(separator);
    }

    if (output) {
        output = prefix + output + suffix;
    }

    return output;
};
