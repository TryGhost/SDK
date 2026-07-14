/**
 * A minimal interface describing the config object the helpers are bound to.
 *
 * In practice this is an nconf instance, but only the `get` method is required
 * by the helpers themselves.
 */
export interface ConfigLike {
    get(key: string): any;
}

/**
 * Returns a subdirectory URL, if defined so in the config.
 *
 * @returns a subdirectory if configured, otherwise an empty string.
 */
export type getSubdirFn = (this: ConfigLike & BoundHelpers) => string;

/**
 * Returns the base URL of the site as set in the config.
 *
 * @returns the url as defined in config, but always with a trailing `/`.
 */
export type getSiteUrlFn = (this: ConfigLike & BoundHelpers) => string;

/**
 * Returns the admin URL as set in the config.
 *
 * @returns the url as defined in config, but always with a trailing `/`, or
 * `undefined` if no admin url is configured.
 */
export type getAdminUrlFn = (this: ConfigLike & BoundHelpers) => string | undefined;

/**
 * The set of helper methods that `bindAll` attaches to the config object.
 */
export interface BoundHelpers {
    getSubdir: getSubdirFn;
    getSiteUrl: getSiteUrlFn;
    getAdminUrl: getAdminUrlFn;
}

/**
 * Binds all the url helpers to the provided nconf instance, attaching
 * `getSubdir`, `getSiteUrl` and `getAdminUrl` methods to it.
 *
 * @param nconf the nconf (or nconf-like) config instance to bind the helpers to.
 */
export function bindAll(nconf: ConfigLike): asserts nconf is ConfigLike & BoundHelpers;
