'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var includes = require('lodash-es/includes');
var isArray = require('lodash-es/isArray');
var isFunction = require('lodash-es/isFunction');
var map = require('lodash-es/map');
var reduce = require('lodash-es/reduce');
var trim = require('lodash-es/trim');
var compact = require('lodash-es/compact');
var concat = require('lodash-es/concat');
var fill = require('lodash-es/fill');
var flatten = require('lodash-es/flatten');
var isString = require('lodash-es/isString');
var size = require('lodash-es/size');
var zip = require('lodash-es/zip');

/**
 * Returns an Array of visibility values.
 * e.g. public,all => ['public, 'all']
 * @param visibility
 * @returns {*}
 */
const parse = (visibility) => {
    if (!visibility) {
        return ['public'];
    }

    return map(visibility.split(','), trim);
};

/**
* Filter resources by visibility.
*
* All resources that have a visibility property, can use this static helper function.
*
*
* @param {Array|Object} items - the items to filter
* @param {Array|String} visibility - the visibility setting to filter on (default: 'public')
* @param {Function} [fn] - function to apply to each item before returning
* @returns {Array|Object} filtered items
*/
const filter = (items, visibility, fn) => {
    if (isFunction(visibility)) {
        fn = visibility;
        visibility = null;
    }

    const memo = isArray(items) ? [] : {};
    const visArray = isArray(visibility) ? visibility : parse(visibility);

    // Fallback behaviour for items that don't have visibility set on them
    const defaultVisibility = 'public';
    const returnByDefault = includes(visArray, defaultVisibility);

    // We don't want to change the structure of what is returned
    return reduce(items, function (items, item, key) {
        // If the item has visibility, check to see if it matches, else if there's no visibility check for a match with the default visibility
        if (includes(visArray, 'all') || item.visibility && includes(visArray, item.visibility) || !item.visibility && returnByDefault) {
            const newItem = fn ? fn(item) : item;
            if (isArray(items)) {
                memo.push(newItem);
            } else {
                memo[key] = newItem;
            }
        }
        return memo;
    }, memo);
};

/**
 * Tags Helper
 *
 * @param {object} data - the data we are filtering
 * @param {object} options - filter options
 */

function tags (data, options = {}) {
    let output = '';
    let separator = options.separator ? options.separator : ', ';
    let prefix = options.prefix ? options.prefix : '';
    let suffix = options.suffix ? options.suffix : '';
    let limit = options.limit ? parseInt(options.limit, 10) : undefined;
    let from = options.from ? parseInt(options.from, 10) : 1;
    let to = options.to ? parseInt(options.to, 10) : undefined;
    let visibilityArr = parse(options.visibility);
    let fallback = options.fallback ? (isArray(options.fallback) ? options.fallback : [options.fallback]) : undefined;
    let displayFn = options.fn ? options.fn : tag => tag.name;

    if (data.tags && data.tags.length) {
        output = filter(data.tags, visibilityArr, displayFn);

        if (size(output) === 0 && fallback) {
            output = filter(fallback, visibilityArr, displayFn);
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

exports.tags = tags;
