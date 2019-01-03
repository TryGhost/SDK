import includes from 'lodash-es/includes';
import isArray from 'lodash-es/isArray';
import isFunction from 'lodash-es/isFunction';
import map from 'lodash-es/map';
import reduce from 'lodash-es/reduce';
import trim from 'lodash-es/trim';

/**
 * Returns an Array of visibility values.
 * e.g. public,all => ['public, 'all']
 * @param visibility
 * @returns {*}
 */
export const parse = (visibility) => {
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
export const filter = (items, visibility, fn) => {
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
