const _ = require('lodash');

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

    return _.map(visibility.split(','), _.trim);
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
    if (_.isFunction(visibility)) {
        fn = visibility;
        visibility = null;
    }

    const memo = _.isArray(items) ? [] : {};
    const visArray = _.isArray(visibility) ? visibility : parse(visibility);

    // Fallback behaviour for items that don't have visibility set on them
    const defaultVisibility = 'public';
    const returnByDefault = _.includes(visArray, defaultVisibility);

    // We don't want to change the structure of what is returned
    return _.reduce(items, function (items, item, key) {
        // If the item has visibility, check to see if it matches, else if there's no visibility check for a match with the default visibility
        if (_.includes(visArray, 'all') || item.visibility && _.includes(visArray, item.visibility) || !item.visibility && returnByDefault) {
            const newItem = fn ? fn(item) : item;
            if (_.isArray(items)) {
                memo.push(newItem);
            } else {
                memo[key] = newItem;
            }
        }
        return memo;
    }, memo);
};

module.exports = {
    parse,
    filter
};
