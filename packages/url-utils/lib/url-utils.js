// Contains all path information to be used throughout the codebase.
const _ = require('lodash');
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
     * @param {Function} options.getSubdir
     * @param {Function} options.getSiteUrl
     * @param {Function} options.getAdminUrl Ghost instance admin URL
    * @param {String} [options.baseApiPath='/ghost/api'] static prefix for serving API. Should not te passed in, unless the API is being run under custom URL
    * @param {('content' | 'admin')} [options.defaultApiType='content'] default API type to be used
     * @param {Object} [options.slugs] object with 2 properties reserved and protected containing arrays of special case slugs
     * @param {Number} [options.redirectCacheMaxAge]
     * @param {String} [options.staticImageUrlPrefix='content/images'] static prefix for serving images. Should not be passed in, unless customizing ghost instance image storage
     */
    constructor(options = {}) {
        const defaultOptions = {
            slugs: null,
            redirectCacheMaxAge: null,
            baseApiPath: '/ghost/api',
            defaultApiType: 'content',
            staticImageUrlPrefix: 'content/images'
        };

        this._config = assignOptions({}, defaultOptions, options);

        this.getSubdir = options.getSubdir;
        this.getSiteUrl = options.getSiteUrl;
        this.getAdminUrl = options.getAdminUrl;
    }

    getProtectedSlugs() {
        let subDir = this.getSubdir();

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
    createUrl(urlPath = '/', absolute = false, trailingSlash) {
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
    urlFor(context, data, absolute) {
        let urlPath = '/';
        let imagePathRe;
        let knownObjects = ['image', 'nav'];
        let baseUrl;
        let hostname;

        // this will become really big
        let knownPaths = {
            home: '/',
            sitemap_xsl: '/sitemap.xsl'
        };

        // Make data properly optional
        if (_.isBoolean(data)) {
            absolute = data;
            data = null;
        }

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
                    baseUrl = this.getSiteUrl().replace(/\/$/, '');
                    urlPath = baseUrl + urlPath;
                }

                return urlPath;
            } else if (context === 'nav' && data.nav) {
                urlPath = data.nav.url;
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
                    absolute = true;
                }
            }
        } else if (context === 'home' && absolute) {
            urlPath = this.getSiteUrl();

            // CASE: there are cases where urlFor('home') needs to be returned without trailing
            // slash e. g. the `{{@site.url}}` helper. See https://github.com/TryGhost/Ghost/issues/8569
            if (data && data.trailingSlash === false) {
                urlPath = urlPath.replace(/\/$/, '');
            }
        } else if (context === 'admin') {
            let adminUrl = this.getAdminUrl() || this.getSiteUrl();
            let adminPath = '/ghost/';

            if (absolute) {
                urlPath = this.urlJoin(adminUrl, adminPath);
            } else {
                urlPath = adminPath;
            }
        } else if (context === 'api') {
            let adminUrl = this.getAdminUrl() || this.getSiteUrl();
            let apiPath = this._config.baseApiPath + '/';

            if (data.type && ['admin', 'content'].includes(data.type)) {
                apiPath += data.type;
            } else {
                apiPath += this._config.defaultApiType;
            }

            // Ensure we end with a trailing slash
            apiPath += '/';

            if (absolute) {
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

        return this.createUrl(urlPath, absolute);
    }

    redirect301(res, redirectUrl) {
        res.set({'Cache-Control': 'public, max-age=' + this._config.redirectCacheMaxAge});
        return res.redirect(301, redirectUrl);
    }

    redirectToAdmin(status, res, adminPath) {
        let redirectUrl = this.urlJoin(this.urlFor('admin', true), adminPath, '/');

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

    lexicalToTransformReady(serializedLexical, itemPath, options) {
        if (typeof itemPath === 'object' && !options) {
            options = itemPath;
            itemPath = null;
        }
        const defaultOptions = {
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, options || {});
        return utils.lexicalToTransformReady(serializedLexical, this.getSiteUrl(), itemPath, _options);
    }

    lexicalRelativeToAbsolute(serializedLexical, itemPath, options) {
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
        return utils.lexicalRelativeToAbsolute(serializedLexical, this.getSiteUrl(), itemPath, _options);
    }

    lexicalRelativeToTransformReady(serializedLexical, itemPath, options) {
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
        return utils.lexicalRelativeToTransformReady(serializedLexical, this.getSiteUrl(), itemPath, _options);
    }

    lexicalAbsoluteToRelative(serializedLexical, options = {}) {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.lexicalAbsoluteToRelative(serializedLexical, this.getSiteUrl(), _options);
    }

    lexicalAbsoluteToTransformReady(serializedLexical, options = {}) {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            cardTransformers: this._config.cardTransformers
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.lexicalAbsoluteToTransformReady(serializedLexical, this.getSiteUrl(), _options);
    }

    plaintextToTransformReady(plaintext, options = {}) {
        const defaultOptions = {
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const _options = assignOptions({}, defaultOptions, options);
        return utils.plaintextToTransformReady(plaintext, this.getSiteUrl(), _options);
    }

    /**
     * Return whether the provided URL is part of the site (checks if same domain and within subdirectory)
     * @param {URL} url
     * @param {string} [context] describing the context for which you need to check a url
     * @returns {boolean}
     */
    isSiteUrl(url, context = 'home') {
        const siteUrl = new URL(this.urlFor(context, true));
        if (siteUrl.host === url.host) {
            if (url.pathname.startsWith(siteUrl.pathname)) {
                return true;
            }
            return false;
        }
        return false;
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
