// Contains all path information to be used throughout the codebase.
const _ = require('lodash');
const {URL} = require('url');
const utils = require('./utils');

// similar to Object.assign but will not override defaults if a source value is undefined
function assignOptions(target, ...sources) {
    const options = sources.map((x) => {
        return Object.entries(x)
            .filter(([, value]) => value !== undefined)
            .reduce((obj, [key, value]) => (obj[key] = value, obj), {});
    });
    return Object.assign(target, ...options);
}
module.exports = class UrlUtils {
    /**
     * Initialization method to pass in URL configurations
     * @param {Object} options
     * @param {String} options.url Ghost instance blog URL
     * @param {String} options.adminUrl Ghost instance admin URL
     * @param {Object} options.apiVersions configuration object which has defined `all` property which is an array of keys for other available properties
     * @param {('v2' | 'v3' | 'v4' | 'canary')} [options.defaultApiVersion] default API version which is one of the values from options.apiVersions
     * @param {('content' | 'admin')} [options.defaultApiType] default API type to be used and is one of the values from options.apiVersions
     * @param {Object} [options.slugs] object with 2 properties reserved and protected containing arrays of special case slugs
     * @param {Number} [options.redirectCacheMaxAge]
     * @param {String} [options.baseApiPath] static prefix for serving API. Should not te passed in, unless the API is being run under custom URL
     * @param {String} [options.staticImageUrlPrefix] static prefix for serving images. Should not be passed in, unless customizing ghost instance image storage
     */
    constructor(options = {}) {
        const defaultOptions = {
            url: null,
            adminUrl: null,
            apiVersions: null,
            slugs: null,
            redirectCacheMaxAge: null,
            baseApiPath: '/ghost/api',
            defaultApiVersion: 'v4',
            defaultApiType: 'content',
            staticImageUrlPrefix: 'content/images'
        };

        this._config = assignOptions({}, defaultOptions, options);

        this._defaultApiPathOptions = {
            baseApiPath: this._config.baseApiPath,
            version: this._config.defaultApiVersion,
            type: this._config.defaultApiType,
            apiVersions: this._config.apiVersions
        };
    }

    /**
     * Returns API path combining base path and path for specific version asked or deprecated by default
     * @param {Object} options
     * @param {string} [options.version="v4"] for which to get the path (v2, v3, canary, etc)
     * @param {string} [options.type="content"] (admin, content, members)
     * @return {string} API Path for version
     */
    getApiPath(options = {}) {
        const _options = assignOptions({}, this._defaultApiPathOptions, options);
        return utils.getApiPath(_options);
    }

    /**
     * Returns path containing only the path for the specific version asked or deprecated by default
     * @param {Object} options
     * @param {string} [options.version="v4"] for which to get the path (v2, v3, canary, etc)
     * @param {string} [options.type="content"] (admin, content)
     * @return {string} API version path
     */
    getVersionPath(options = {}) {
        const _options = assignOptions({}, this._defaultApiPathOptions, options);
        return utils.getVersionPath(_options);
    }

    /**
     * Returns the base URL of the site as set in the config.
     *
     * Secure:
     * If the request is secure, we want to force returning the site url as https.
     * Imagine Ghost runs with http, but nginx allows SSL connections.
     *
     * @param {boolean} secure
     * @return {string} URL returns the url as defined in config, but always with a trailing `/`
     */
    getSiteUrl(secure = false) {
        let siteUrl = this._config.url;

        if (secure) {
            siteUrl = this._config.url.replace('http://', 'https://');
        }

        if (!siteUrl.match(/\/$/)) {
            siteUrl += '/';
        }

        return siteUrl;
    }

    /**
     * Returns a subdirectory URL, if defined so in the config.
     * @return {string} URL a subdirectory if configured.
     */
    getSubdir() {
        // Parse local path location
        let {pathname} = new URL(this._config.url);
        let subdir;

        // Remove trailing slash
        if (pathname !== '/') {
            pathname = pathname.replace(/\/$/, '');
        }

        subdir = pathname === '/' ? '' : pathname;
        return subdir;
    }

    getProtectedSlugs() {
        var subDir = this.getSubdir();

        if (!_.isEmpty(subDir)) {
            return this._config.slugs.concat([subDir.split('/').pop()]);
        } else {
            return this._config.slugs;
        }
    }

    /** urlJoin
     * Returns a URL/path for internal use in Ghost.
     * @param {string} arguments takes arguments and concats those to a valid path/URL.
     * @return {string} URL concatinated URL/path of arguments.
     */
    urlJoin(...parts) {
        return utils.urlJoin(parts, {rootUrl: this.getSiteUrl()});
    }

    /**
     * admin:url is optional
     */
    getAdminUrl() {
        let adminUrl = this._config.adminUrl;
        const subDir = this.getSubdir();

        if (!adminUrl) {
            return;
        }

        if (!adminUrl.match(/\/$/)) {
            adminUrl += '/';
        }

        adminUrl = this.urlJoin(adminUrl, subDir, '/');
        adminUrl = utils.deduplicateSubdirectory(adminUrl, this.getSiteUrl());
        return adminUrl;
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
    // - secure (optional, default:false) - boolean whether or not to force SSL
    // Returns:
    //  - a URL which always ends with a slash
    createUrl(urlPath = '/', absolute = false, secure, trailingSlash) {
        let base;

        // create base of url, always ends without a slash
        if (absolute) {
            base = this.getSiteUrl(secure);
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
    urlFor(context, data, absolute) {
        var urlPath = '/',
            secure,
            imagePathRe,
            knownObjects = ['image', 'nav'],
            baseUrl,
            hostname,

            // this will become really big
            knownPaths = {
                home: '/',
                sitemap_xsl: '/sitemap.xsl'
            };

        // Make data properly optional
        if (_.isBoolean(data)) {
            absolute = data;
            data = null;
        }

        // Can pass 'secure' flag in either context or data arg
        secure = (context && context.secure) || (data && data.secure);

        if (_.isObject(context) && context.relativeUrl) {
            urlPath = context.relativeUrl;
        } else if (_.isString(context) && _.indexOf(knownObjects, context) !== -1) {
            if (context === 'image' && data.image) {
                urlPath = data.image;
                imagePathRe = new RegExp('^' + this.getSubdir() + '/' + this._config.staticImageUrlPrefix);
                absolute = imagePathRe.test(data.image) ? absolute : false;

                if (absolute) {
                    // Remove the sub-directory from the URL because ghostConfig will add it back.
                    urlPath = urlPath.replace(new RegExp('^' + this.getSubdir()), '');
                    baseUrl = this.getSiteUrl(secure).replace(/\/$/, '');
                    urlPath = baseUrl + urlPath;
                }

                return urlPath;
            } else if (context === 'nav' && data.nav) {
                urlPath = data.nav.url;
                secure = data.nav.secure || secure;
                baseUrl = this.getSiteUrl(secure);
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
                    absolute = true;
                }
            }
        } else if (context === 'home' && absolute) {
            urlPath = this.getSiteUrl(secure);

            // CASE: there are cases where urlFor('home') needs to be returned without trailing
            // slash e. g. the `{{@site.url}}` helper. See https://github.com/TryGhost/Ghost/issues/8569
            if (data && data.trailingSlash === false) {
                urlPath = urlPath.replace(/\/$/, '');
            }
        } else if (context === 'admin') {
            urlPath = this.getAdminUrl() || this.getSiteUrl();

            if (absolute) {
                urlPath += 'ghost/';
            } else {
                urlPath = '/ghost/';
            }
        } else if (context === 'api') {
            urlPath = this.getAdminUrl() || this.getSiteUrl();
            let apiPath = this.getApiPath();
            // CASE: with or without protocol? If your blog url (or admin url) is configured to http, it's still possible that e.g. nginx allows both https+http.
            // So it depends how you serve your blog. The main focus here is to avoid cors problems.
            // @TODO: rename cors
            if (data && data.cors) {
                if (!urlPath.match(/^https:/)) {
                    urlPath = urlPath.replace(/^.*?:\/\//g, '//');
                }
            }

            if (data && data.version) {
                apiPath = this.getApiPath({version: data.version, type: data.versionType});
            }

            if (absolute) {
                urlPath = urlPath.replace(/\/$/, '') + apiPath;
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

        return this.createUrl(urlPath, absolute, secure);
    }

    redirect301(res, redirectUrl) {
        res.set({'Cache-Control': 'public, max-age=' + this._config.redirectCacheMaxAge});
        return res.redirect(301, redirectUrl);
    }

    redirectToAdmin(status, res, adminPath) {
        var redirectUrl = this.urlJoin(this.urlFor('admin', true), adminPath, '/');

        if (status === 301) {
            return this.redirect301(res, redirectUrl);
        }
        return res.redirect(redirectUrl);
    }

    absoluteToRelative(url, options) {
        return utils.absoluteToRelative(url, this.getSiteUrl(), options);
    }

    relativeToAbsolute(url, options) {
        return utils.relativeToAbsolute(url, this.getSiteUrl(), options);
    }

    toTransformReady(url, itemPath, options) {
        if (typeof itemPath === 'object' && !options) {
            options = itemPath;
            itemPath = null;
        }
        return utils.toTransformReady(url, this.getSiteUrl(), itemPath, options);
    }

    absoluteToTransformReady(url, options) {
        return utils.absoluteToTransformReady(url, this.getSiteUrl(), options);
    }

    relativeToTransformReady(url, options) {
        return utils.relativeToTransformReady(url, this.getSiteUrl(), options);
    }

    transformReadyToAbsolute(url, options) {
        return utils.transformReadyToAbsolute(url, this.getSiteUrl(), options);
    }

    transformReadyToRelative(url, options) {
        return utils.transformReadyToRelative(url, this.getSiteUrl(), options);
    }

    htmlToTransformReady(html, itemPath, options) {
        if (typeof itemPath === 'object' && !options) {
            options = itemPath;
            itemPath = null;
        }
        return utils.htmlToTransformReady(html, this.getSiteUrl(), itemPath, options);
    }

    /**
     * Convert relative URLs in html into absolute URLs
     * @param {string} html
     * @param {string} itemPath (path of current context)
     * @param {Object} options
     * @returns {object} htmlContent
     * @description Takes html, blog url and item path and converts relative url into
     * absolute urls. Returns an object. The html string can be accessed by calling `html()` on
     * the variable that takes the result of this function
     */
    htmlRelativeToAbsolute(html, itemPath, options) {
        if (typeof itemPath === 'object' && !options) {
            options = itemPath;
            itemPath = null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options || {});
        return utils.htmlRelativeToAbsolute(html, this.getSiteUrl(), itemPath, _options);
    }

    htmlRelativeToTransformReady(html, itemPath, options) {
        if (typeof itemPath === 'object' && !options) {
            options = itemPath;
            itemPath = null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options || {});
        return utils.htmlRelativeToTransformReady(html, this.getSiteUrl(), itemPath, _options);
    }

    htmlAbsoluteToRelative(html, options = {}) {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.htmlAbsoluteToRelative(html, this.getSiteUrl(), _options);
    }

    htmlAbsoluteToTransformReady(html, options = {}) {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.htmlAbsoluteToTransformReady(html, this.getSiteUrl(), _options);
    }

    markdownToTransformReady(markdown, itemPath, options) {
        if (typeof itemPath === 'object' && !options) {
            options = itemPath;
            itemPath = null;
        }
        return utils.markdownToTransformReady(markdown, this.getSiteUrl(), itemPath, options);
    }

    markdownRelativeToAbsolute(markdown, itemPath, options) {
        if (typeof itemPath === 'object' && !options) {
            options = itemPath;
            itemPath = null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options || {});
        return utils.markdownRelativeToAbsolute(markdown, this.getSiteUrl(), itemPath, _options);
    }

    markdownRelativeToTransformReady(markdown, itemPath, options) {
        if (typeof itemPath === 'object' && !options) {
            options = itemPath;
            itemPath = null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options || {});
        return utils.markdownRelativeToTransformReady(markdown, this.getSiteUrl(), itemPath, _options);
    }

    markdownAbsoluteToRelative(markdown, options = {}) {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.markdownAbsoluteToRelative(markdown, this.getSiteUrl(), _options);
    }

    markdownAbsoluteToTransformReady(markdown, options) {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.markdownAbsoluteToTransformReady(markdown, this.getSiteUrl(), _options);
    }

    mobiledocToTransformReady(serializedMobiledoc, itemPath, options) {
        if (typeof itemPath === 'object' && !options) {
            options = itemPath;
            itemPath = null;
        }
        const defaultOptions = {
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, options || {});
        return utils.mobiledocToTransformReady(serializedMobiledoc, this.getSiteUrl(), itemPath, _options);
    }

    mobiledocRelativeToAbsolute(serializedMobiledoc, itemPath, options) {
        if (typeof itemPath === 'object' && !options) {
            options = itemPath;
            itemPath = null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, options || {});
        return utils.mobiledocRelativeToAbsolute(serializedMobiledoc, this.getSiteUrl(), itemPath, _options);
    }

    mobiledocRelativeToTransformReady(serializedMobiledoc, itemPath, options) {
        if (typeof itemPath === 'object' && !options) {
            options = itemPath;
            itemPath = null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, options || {});
        return utils.mobiledocRelativeToTransformReady(serializedMobiledoc, this.getSiteUrl(), itemPath, _options);
    }

    mobiledocAbsoluteToRelative(serializedMobiledoc, options = {}) {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.mobiledocAbsoluteToRelative(serializedMobiledoc, this.getSiteUrl(), _options);
    }

    mobiledocAbsoluteToTransformReady(serializedMobiledoc, options = {}) {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.mobiledocAbsoluteToTransformReady(serializedMobiledoc, this.getSiteUrl(), _options);
    }

    get isSSL() {
        return utils.isSSL;
    }

    get replacePermalink() {
        return utils.replacePermalink;
    }

    get deduplicateDoubleSlashes() {
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
    get STATIC_IMAGE_URL_PREFIX() {
        return this._config.staticImageUrlPrefix;
    }

    // expose underlying functions to ease testing
    get _utils() {
        return utils;
    }
};
