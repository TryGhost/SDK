import {LRUCache} from 'lru-cache';

export interface Memoized<V> {
    (key: string): V;
    clear(): void;
}

/**
 * Memoize a pure single-argument function keyed on its string input, keeping
 * the `max` most recently used results so arbitrary input can't grow the cache
 * unchecked. Errors thrown by `fn` are not cached.
 *
 * @param {Function} fn function to memoize, must be a pure function of its input
 * @param {number} [max=100] maximum number of cached results
 * @returns {Function} memoized function with a `clear()` method
 */
export default function memoize<V extends object | string>(fn: (key: string) => V, max: number = 100): Memoized<V> {
    const cache = new LRUCache<string, V>({max});

    const memoized = function (key: string): V {
        let value = cache.get(key);

        if (value === undefined) {
            value = fn(key);
            cache.set(key, value);
        }

        return value;
    };

    memoized.clear = function clear(): void {
        cache.clear();
    };

    return memoized;
}
