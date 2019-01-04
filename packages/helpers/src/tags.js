import * as visibility from './utils/visibility';
import compact from 'lodash-es/compact';
import concat from 'lodash-es/concat';
import fill from 'lodash-es/fill';
import flatten from 'lodash-es/flatten';
import isArray from 'lodash-es/isArray';
import isString from 'lodash-es/isString';
import size from 'lodash-es/size';
import zip from 'lodash-es/zip';

/**
 * Tags Helper
 *
 * @param {object} data - the data we are filtering
 * @param {object} options - filter options
 */

export default function (data, options = {}) {
    let output = '';
    let separator = options.separator ? options.separator : '';
    let prefix = options.prefix ? options.prefix : '';
    let suffix = options.suffix ? options.suffix : '';
    let limit = options.limit ? parseInt(options.limit, 10) : undefined;
    let from = options.from ? parseInt(options.from, 10) : 1;
    let to = options.to ? parseInt(options.to, 10) : undefined;
    let visibilityArr = visibility.parse(options.visibility);
    let fallback = options.fallback ? (isArray(options.fallback) ? options.fallback : [options.fallback]) : undefined;
    let displayFn = options.fn ? options.fn : tag => tag.name;

    if (data.tags && data.tags.length) {
        output = visibility.filter(data.tags, visibilityArr, displayFn);

        if (size(output) === 0 && fallback) {
            output = visibility.filter(fallback, visibilityArr, displayFn);
        }

        from -= 1; // From uses 1-indexed, but array uses 0-indexed.
        to = to || limit + from || output.length;
        output = output.slice(from, to);
    }

    // If we have a result from the filtering process...
    if (size(output) > 0) {
        // Check to see if options.fn returned a string, or something else
        if (isString(output[0])) {
            // If we're working with a string, do a simple join and string-concat
            separator = separator || ', ';
            output = prefix + output.join(separator) + suffix;
        } else {
            // Else, operate on the array, and return an array
            if (separator) {
                // If we have a separator, use lodash to make pairs of items & separators
                output = zip(output, fill(Array(output.length), separator));
                // Flatten our pairs, and remove the final separator
                output = flatten(output).slice(0, -1);
            }

            // Add our prefix and suffix
            output = concat(prefix, output, suffix);
            // Remove any falsy items after all that (i.e. if prefix/suffix were empty);
            output = compact(output);
        }
    }

    return output;
}
