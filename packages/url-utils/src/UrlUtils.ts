// Contains all path information to be used throughout the codebase.
import * as _ from 'lodash';
import utils from './utils';
import {URL} from 'url';

interface UrlUtilsSlugs {
    reserved?: string[];
    protected?: string[];
}

interface UrlUtilsConfig {
    slugs: UrlUtilsSlugs | null;
    redirectCacheMaxAge: number | null;
    baseApiPath: string;
    defaultApiType: 'content' | 'admin';
    staticImageUrlPrefix: string;
    cardTransformers?: any[];
}

interface UrlUtilsOptions {
    getSubdir: () => string;
    getSiteUrl: () => string;
    getAdminUrl?: () => string;
    baseApiPath?: string;
    defaultApiType?: 'content' | 'admin';
    slugs?: UrlUtilsSlugs | null;
    redirectCacheMaxAge?: number | null;
    staticImageUrlPrefix?: string;
    cardTransformers?: any[];
}

// similar to Object.assign but will not override defaults if a source value is undefined
function assignOptions<T extends Record<string, any>>(target: T, ...sources: Array<Partial<T>>): T {
    const options = sources.map((x: Partial<T>) => {
        return Object.entries(x)
            .filter(([, value]) => value !== undefined)
            .reduce((obj, [key, value]) => {
                obj[key] = value;
                return obj;
            }, {} as Record<string, any>);
    });
    return Object.assign(target, ...options) as T;
}

class UrlUtils {
    private _config: UrlUtilsConfig;
    getSubdir: () => string;
    getSiteUrl: () => string;
    getAdminUrl?: () => string;
    /**
     * Initialization method to pass in URL configurations
     * @param options - Configuration options for UrlUtils
     * @param options.getSubdir - Function that returns the subdirectory path
     * @param options.getSiteUrl - Function that returns the site URL
     * @param options.getAdminUrl - Function that returns the Ghost instance admin URL
     * @param options.baseApiPath - Static prefix for serving API (default: '/ghost/api'). Should not be passed in, unless the API is being run under custom URL
     * @param options.defaultApiType - Default API type to be used (default: 'content')
     * @param options.slugs - Object with 2 properties reserved and protected containing arrays of special case slugs
     * @param options.redirectCacheMaxAge - Cache max age for redirects
     * @param options.staticImageUrlPrefix - Static prefix for serving images (default: 'content/images'). Should not be passed in, unless customizing ghost instance image storage
     */
    constructor(options: UrlUtilsOptions = {} as UrlUtilsOptions) {
        const defaultOptions: UrlUtilsConfig = {
            slugs: null,
            redirectCacheMaxAge: null,
            baseApiPath: '/ghost/api',
            defaultApiType: 'content',
            staticImageUrlPrefix: 'content/images'
        };

        this._config = assignOptions(defaultOptions, options);

        // Handle legacy format where slugs is passed as an array
        if (Array.isArray(this._config.slugs)) {
            this._config.slugs = {protected: this._config.slugs as any};
        }

        this.getSubdir = options.getSubdir;
        this.getSiteUrl = options.getSiteUrl;
        this.getAdminUrl = options.getAdminUrl;
    }

    getProtectedSlugs(): string[] | null {
        const subDir = this.getSubdir();

        if (!_.isEmpty(subDir) && this._config.slugs) {
            const protectedSlugs = this._config.slugs.protected || [];
            return protectedSlugs.concat([subDir.split('/').pop()!]);
        } else if (this._config.slugs) {
            return this._config.slugs.protected || null;
        } else {
            return null;
        }
    }

    /** urlJoin
     * Returns a URL/path for internal use in Ghost.
     * @param parts - Takes arguments and concats those to a valid path/URL.
     * @return URL concatenated URL/path of arguments.
     */
    urlJoin(...parts: string[]): string {
        return utils.urlJoin(parts, {rootUrl: this.getSiteUrl()});
    }

    // ## createUrl
    // Simple url creation from a given path
    // Ensures that our urls contain the subdirectory if there is one
    // And are correctly formatted as either relative or absolute
    // Usage:
    // createUrl('/', true) -> http://my-ghost-blog.com/
    // E.g. /blog/ subdir
    // createUrl('/welcome-to-ghost/') -> /blog/welcome-to-ghost/
    // Parameters:
    // - urlPath - string which must start and end with a slash
    // - absolute (optional, default:false) - boolean whether or not the url should be absolute
    // Returns:
    //  - a URL which always ends with a slash
    createUrl(urlPath: string = '/', absolute: boolean = false, trailingSlash?: boolean): string {
        let base;

        // create base of url, always ends without a slash
        if (absolute) {
            base = this.getSiteUrl();
        } else {
            base = this.getSubdir();
        }

        if (trailingSlash) {
            if (!urlPath.match(/\/$/)) {
                urlPath += '/';
            }
        }

        return this.urlJoin(base, urlPath);
    }

    // ## urlFor
    // Synchronous url creation for a given context
    // Can generate a url for a named path and given path.
    // Determines what sort of context it has been given, and delegates to the correct generation method,
    // Finally passing to createUrl, to ensure any subdirectory is honoured, and the url is absolute if needed
    // Usage:
    // urlFor('home', true) -> http://my-ghost-blog.com/
    // E.g. /blog/ subdir
    // urlFor({relativeUrl: '/my-static-page/'}) -> /blog/my-static-page/
    // Parameters:
    // - context - a string, or json object describing the context for which you need a url
    // - data (optional) - a json object containing data needed to generate a url
    // - absolute (optional, default:false) - boolean whether or not the url should be absolute
    // This is probably not the right place for this, but it's the best place for now
    // @TODO: rewrite, very hard to read, create private functions!
    urlFor(
        context: string | {relativeUrl: string},
        data?: any | boolean,
        absolute?: boolean
    ): string {
        let urlPath = '/';
        let imagePathRe: RegExp | undefined;
        const knownObjects = ['image', 'nav'];
        let baseUrl: string;
        let hostname: string;

        // this will become really big
        const knownPaths: Record<string, string> = {
            home: '/',
            sitemap_xsl: '/sitemap.xsl'
        };

        // Make data properly optional
        let actualData: any = null;
        let actualAbsolute: boolean = false;
        if (_.isBoolean(data)) {
            actualAbsolute = data;
            actualData = null;
        } else {
            actualData = data;
            actualAbsolute = absolute || false;
        }

        if (_.isObject(context) && context.relativeUrl) {
            urlPath = context.relativeUrl;
        } else if (_.isString(context) && _.indexOf(knownObjects, context) !== -1) {
            if (context === 'image' && actualData && actualData.image) {
                urlPath = actualData.image;
                imagePathRe = new RegExp('^' + this.getSubdir() + '/' + this._config.staticImageUrlPrefix);
                actualAbsolute = imagePathRe.test(actualData.image) ? actualAbsolute : false;

                if (actualAbsolute) {
                    // Remove the sub-directory from the URL because ghostConfig will add it back.
                    urlPath = urlPath.replace(new RegExp('^' + this.getSubdir()), '');
                    baseUrl = this.getSiteUrl().replace(/\/$/, '');
                    urlPath = baseUrl + urlPath;
                }

                return urlPath;
            } else if (context === 'nav' && actualData && actualData.nav) {
                urlPath = actualData.nav.url;
                baseUrl = this.getSiteUrl();
                hostname = baseUrl.split('//')[1];

                // If the hostname is present in the url
                if (urlPath.indexOf(hostname) > -1
                    // do no not apply, if there is a subdomain, or a mailto link
                    && !urlPath.split(hostname)[0].match(/\.|mailto:/)
                    // do not apply, if there is a port after the hostname
                    && urlPath.split(hostname)[1].substring(0, 1) !== ':') {
                    // make link relative to account for possible mismatch in http/https etc, force absolute
                    urlPath = urlPath.split(hostname)[1];
                    urlPath = this.urlJoin('/', urlPath);
                    actualAbsolute = true;
                }
            }
        } else if (context === 'home' && actualAbsolute) {
            urlPath = this.getSiteUrl();

            // CASE: there are cases where urlFor('home') needs to be returned without trailing
            // slash e. g. the `{{@site.url}}` helper. See https://github.com/TryGhost/Ghost/issues/8569
            if (actualData && actualData.trailingSlash === false) {
                urlPath = urlPath.replace(/\/$/, '');
            }
        } else if (context === 'admin') {
            const adminUrl = (this.getAdminUrl && this.getAdminUrl()) || this.getSiteUrl();
            const adminPath = '/ghost/';

            if (actualAbsolute) {
                urlPath = this.urlJoin(adminUrl, adminPath);
            } else {
                urlPath = adminPath;
            }
        } else if (context === 'api') {
            const adminUrl = (this.getAdminUrl && this.getAdminUrl()) || this.getSiteUrl();
            let apiPath = this._config.baseApiPath + '/';

            if (actualData && actualData.type && ['admin', 'content'].includes(actualData.type)) {
                apiPath += actualData.type;
            } else {
                apiPath += this._config.defaultApiType;
            }

            // Ensure we end with a trailing slash
            apiPath += '/';

            if (actualAbsolute) {
                urlPath = this.urlJoin(adminUrl, apiPath);
            } else {
                urlPath = apiPath;
            }
        } else if (_.isString(context) && _.indexOf(_.keys(knownPaths), context) !== -1) {
            // trying to create a url for a named path
            urlPath = knownPaths[context];
        }

        // This url already has a protocol so is likely an external url to be returned
        // or it is an alternative scheme, protocol-less, or an anchor-only path
        if (urlPath && (urlPath.indexOf('://') !== -1 || urlPath.match(/^(\/\/|#|[a-zA-Z0-9-]+:)/))) {
            return urlPath;
        }

        return this.createUrl(urlPath, actualAbsolute);
    }

    redirect301(res: any, redirectUrl: string): any {
        res.set({'Cache-Control': 'public, max-age=' + this._config.redirectCacheMaxAge});
        return res.redirect(301, redirectUrl);
    }

    redirectToAdmin(status: number, res: any, adminPath: string): any {
        const redirectUrl = this.urlJoin(this.urlFor('admin', true), adminPath, '/');

        if (status === 301) {
            return this.redirect301(res, redirectUrl);
        }
        return res.redirect(redirectUrl);
    }

    absoluteToRelative(url: string, options?: any): string {
        return utils.absoluteToRelative(url, this.getSiteUrl(), options);
    }

    relativeToAbsolute(url: string, options?: any): string {
        return utils.relativeToAbsolute(url, this.getSiteUrl(), options);
    }

    toTransformReady(url: string, itemPath?: string | any | null, options?: any): string {
        let actualItemPath: string | null = null;
        let actualOptions: any;
        if (itemPath && typeof itemPath === 'object' && !options) {
            actualOptions = itemPath;
            actualItemPath = null;
        } else {
            actualOptions = options;
            actualItemPath = typeof itemPath === 'string' ? itemPath : null;
        }
        return utils.toTransformReady(url, this.getSiteUrl(), actualItemPath, actualOptions);
    }

    absoluteToTransformReady(url: string, options?: any): string {
        return utils.absoluteToTransformReady(url, this.getSiteUrl(), options);
    }

    relativeToTransformReady(url: string, options?: any): string {
        return utils.relativeToTransformReady(url, this.getSiteUrl(), options);
    }

    transformReadyToAbsolute(url: string, options?: any): string {
        return utils.transformReadyToAbsolute(url, this.getSiteUrl(), options);
    }

    transformReadyToRelative(url: string, options?: any): string {
        return utils.transformReadyToRelative(url, this.getSiteUrl(), options);
    }

    htmlToTransformReady(html: string, itemPath?: string | any | null, options?: any): string {
        let actualItemPath: string | null = null;
        let actualOptions: any;
        if (itemPath && typeof itemPath === 'object' && !options) {
            actualOptions = itemPath;
            actualItemPath = null;
        } else {
            actualOptions = options;
            actualItemPath = typeof itemPath === 'string' ? itemPath : null;
        }
        return utils.htmlToTransformReady(html, this.getSiteUrl(), actualItemPath, actualOptions);
    }

    /**
     * Convert relative URLs in html into absolute URLs
     * @param html - HTML string
     * @param itemPath - Path of current context
     * @param options - Options object
     * @returns HTML string with absolute URLs
     * @description Takes html, blog url and item path and converts relative url into
     * absolute urls. Returns an object. The html string can be accessed by calling `html()` on
     * the variable that takes the result of this function
     */
    htmlRelativeToAbsolute(html: string, itemPath?: string | any | null, options?: any): string {
        let actualItemPath: string | null = null;
        let actualOptions: any;
        if (itemPath && typeof itemPath === 'object' && !options) {
            actualOptions = itemPath;
            actualItemPath = null;
        } else {
            actualOptions = options;
            actualItemPath = typeof itemPath === 'string' ? itemPath : null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, actualOptions || {});
        return utils.htmlRelativeToAbsolute(html, this.getSiteUrl(), actualItemPath || undefined, _options);
    }

    htmlRelativeToTransformReady(html: string, itemPath?: string | any | null, options?: any): string {
        let actualItemPath: string | null = null;
        let actualOptions: any;
        if (itemPath && typeof itemPath === 'object' && !options) {
            actualOptions = itemPath;
            actualItemPath = null;
        } else {
            actualOptions = options;
            actualItemPath = typeof itemPath === 'string' ? itemPath : null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, actualOptions || {});
        return utils.htmlRelativeToTransformReady(html, this.getSiteUrl(), actualItemPath || '', _options);
    }

    htmlAbsoluteToRelative(html: string, options: any = {}): string {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.htmlAbsoluteToRelative(html, this.getSiteUrl(), _options);
    }

    htmlAbsoluteToTransformReady(html: string, options: any = {}): string {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.htmlAbsoluteToTransformReady(html, this.getSiteUrl(), _options);
    }

    markdownToTransformReady(markdown: string, itemPath?: string | any | null, options?: any): string {
        let actualItemPath: string | null = null;
        let actualOptions: any;
        if (itemPath && typeof itemPath === 'object' && !options) {
            actualOptions = itemPath;
            actualItemPath = null;
        } else {
            actualOptions = options;
            actualItemPath = typeof itemPath === 'string' ? itemPath : null;
        }
        return utils.markdownToTransformReady(markdown, this.getSiteUrl(), actualItemPath, actualOptions);
    }

    markdownRelativeToAbsolute(markdown: string, itemPath?: string | any | null, options?: any): string {
        let actualItemPath: string | null = null;
        let actualOptions: any;
        if (itemPath && typeof itemPath === 'object' && !options) {
            actualOptions = itemPath;
            actualItemPath = null;
        } else {
            actualOptions = options;
            actualItemPath = typeof itemPath === 'string' ? itemPath : null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, actualOptions || {});
        return utils.markdownRelativeToAbsolute(markdown, this.getSiteUrl(), actualItemPath || undefined, _options);
    }

    markdownRelativeToTransformReady(markdown: string, itemPath?: string | any | null, options?: any): string {
        let actualItemPath: string | null = null;
        let actualOptions: any;
        if (itemPath && typeof itemPath === 'object' && !options) {
            actualOptions = itemPath;
            actualItemPath = null;
        } else {
            actualOptions = options;
            actualItemPath = typeof itemPath === 'string' ? itemPath : null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, actualOptions || {});
        return utils.markdownRelativeToTransformReady(markdown, this.getSiteUrl(), actualItemPath || '', _options);
    }

    markdownAbsoluteToRelative(markdown: string, options: any = {}): string {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.markdownAbsoluteToRelative(markdown, this.getSiteUrl(), _options);
    }

    markdownAbsoluteToTransformReady(markdown: string, options?: any): string {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.markdownAbsoluteToTransformReady(markdown, this.getSiteUrl(), _options);
    }

    mobiledocToTransformReady(serializedMobiledoc: string, itemPath?: string | any | null, options?: any): string {
        let actualItemPath: string | null = null;
        let actualOptions: any;
        if (itemPath && typeof itemPath === 'object' && !options) {
            actualOptions = itemPath;
            actualItemPath = null;
        } else {
            actualOptions = options;
            actualItemPath = typeof itemPath === 'string' ? itemPath : null;
        }
        const defaultOptions = {
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, actualOptions || {});
        return utils.mobiledocToTransformReady(serializedMobiledoc, this.getSiteUrl(), actualItemPath, _options);
    }

    mobiledocRelativeToAbsolute(serializedMobiledoc: string, itemPath?: string | any | null, options?: any): string {
        let actualItemPath: string | null = null;
        let actualOptions: any;
        if (itemPath && typeof itemPath === 'object' && !options) {
            actualOptions = itemPath;
            actualItemPath = null;
        } else {
            actualOptions = options;
            actualItemPath = typeof itemPath === 'string' ? itemPath : null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, actualOptions || {});
        return utils.mobiledocRelativeToAbsolute(serializedMobiledoc, this.getSiteUrl(), actualItemPath || undefined, _options);
    }

    mobiledocRelativeToTransformReady(serializedMobiledoc: string, itemPath?: string | any | null, options?: any): string {
        let actualItemPath: string | null = null;
        let actualOptions: any;
        if (itemPath && typeof itemPath === 'object' && !options) {
            actualOptions = itemPath;
            actualItemPath = null;
        } else {
            actualOptions = options;
            actualItemPath = typeof itemPath === 'string' ? itemPath : null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, actualOptions || {});
        return utils.mobiledocRelativeToTransformReady(serializedMobiledoc, this.getSiteUrl(), actualItemPath || '', _options);
    }

    mobiledocAbsoluteToRelative(serializedMobiledoc: string, options: any = {}): string {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.mobiledocAbsoluteToRelative(serializedMobiledoc, this.getSiteUrl(), _options);
    }

    mobiledocAbsoluteToTransformReady(serializedMobiledoc: string, options: any = {}): string {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.mobiledocAbsoluteToTransformReady(serializedMobiledoc, this.getSiteUrl(), _options);
    }

    lexicalToTransformReady(serializedLexical: string, itemPath?: string | any | null, options?: any): string {
        let actualItemPath: string | null = null;
        let actualOptions: any;
        if (itemPath && typeof itemPath === 'object' && !options) {
            actualOptions = itemPath;
            actualItemPath = null;
        } else {
            actualOptions = options;
            actualItemPath = typeof itemPath === 'string' ? itemPath : null;
        }
        const defaultOptions = {
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, actualOptions || {});
        return utils.lexicalToTransformReady(serializedLexical, this.getSiteUrl(), actualItemPath, _options);
    }

    lexicalRelativeToAbsolute(serializedLexical: string, itemPath?: string | any | null, options?: any): string {
        let actualItemPath: string | null = null;
        let actualOptions: any;
        if (itemPath && typeof itemPath === 'object' && !options) {
            actualOptions = itemPath;
            actualItemPath = null;
        } else {
            actualOptions = options;
            actualItemPath = typeof itemPath === 'string' ? itemPath : null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, actualOptions || {});
        return utils.lexicalRelativeToAbsolute(serializedLexical, this.getSiteUrl(), actualItemPath || undefined, _options);
    }

    lexicalRelativeToTransformReady(serializedLexical: string, itemPath?: string | any | null, options?: any): string {
        let actualItemPath: string | null = null;
        let actualOptions: any;
        if (itemPath && typeof itemPath === 'object' && !options) {
            actualOptions = itemPath;
            actualItemPath = null;
        } else {
            actualOptions = options;
            actualItemPath = typeof itemPath === 'string' ? itemPath : null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, actualOptions || {});
        return utils.lexicalRelativeToTransformReady(serializedLexical, this.getSiteUrl(), actualItemPath || '', _options);
    }

    lexicalAbsoluteToRelative(serializedLexical: string, options: any = {}): string {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.lexicalAbsoluteToRelative(serializedLexical, this.getSiteUrl(), _options);
    }

    lexicalAbsoluteToTransformReady(serializedLexical: string, options: any = {}): string {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.lexicalAbsoluteToTransformReady(serializedLexical, this.getSiteUrl(), _options);
    }

    plaintextToTransformReady(plaintext: string, options: any = {}): string {
        const defaultOptions = {
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.plaintextToTransformReady(plaintext, this.getSiteUrl(), _options);
    }

    /**
     * Return whether the provided URL is part of the site (checks if same domain and within subdirectory)
     * @param url - URL object to check
     * @param context - Context describing the context for which you need to check a url (default: 'home')
     * @returns boolean indicating if URL is part of the site
     */
    isSiteUrl(url: URL, context: string = 'home'): boolean {
        const siteUrl = new URL(this.urlFor(context, true));
        if (siteUrl.host === url.host) {
            if (url.pathname.startsWith(siteUrl.pathname)) {
                return true;
            }
            return false;
        }
        return false;
    }

    get isSSL(): typeof utils.isSSL {
        return utils.isSSL;
    }

    get replacePermalink(): typeof utils.replacePermalink {
        return utils.replacePermalink;
    }

    get deduplicateDoubleSlashes(): typeof utils.deduplicateDoubleSlashes {
        return utils.deduplicateDoubleSlashes;
    }

    /**
     * If you request **any** image in Ghost, it get's served via
     * http://your-blog.com/content/images/2017/01/02/author.png
     *
     * /content/images/ is a static prefix for serving images!
     *
     * But internally the image is located for example in your custom content path:
     * my-content/another-dir/images/2017/01/02/author.png
     */
    get STATIC_IMAGE_URL_PREFIX(): string {
        return this._config.staticImageUrlPrefix;
    }

    // expose underlying functions to ease testing
    get _utils(): typeof utils {
        return utils;
    }
}

export default UrlUtils;
module.exports = UrlUtils;
