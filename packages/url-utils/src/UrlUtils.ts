// Contains all path information to be used throughout the codebase.
import * as _ from 'lodash';
import utils from './utils';
import type {
    HtmlTransformOptionsInput,
    MarkdownTransformOptionsInput,
    MobiledocTransformOptionsInput,
    LexicalTransformOptionsInput,
    MobiledocCardTransformer,
    BaseUrlOptionsInput
} from './utils/types';
import type {AbsoluteToRelativeOptionsInput} from './utils/absolute-to-relative';
import type {RelativeToAbsoluteOptionsInput} from './utils/relative-to-absolute';
import type {AbsoluteToTransformReadyOptionsInput as AbsoluteToTransformReadyOptionsInputType} from './utils/absolute-to-transform-ready';
import type {RelativeToTransformReadyOptionsInput as RelativeToTransformReadyOptionsInputType} from './utils/relative-to-transform-ready';
import type {ToTransformReadyOptions} from './utils/to-transform-ready';
import type {TransformReadyToAbsoluteOptionsInput} from './utils/transform-ready-to-absolute';
import type {TransformReadyReplacementOptionsInput as TransformReadyToRelativeOptionsInput} from './utils/types';

interface ExpressResponse {
    set(headers: Record<string, string>): void;
    redirect(status: number, url: string): void;
    redirect(url: string): void;
}

interface AssetBaseUrls {
    image: string | null;
    files: string | null;
    media: string | null;
}

interface UrlUtilsConfig {
    slugs: string[] | null;
    redirectCacheMaxAge: number | null;
    baseApiPath: string;
    defaultApiType: 'content' | 'admin';
    staticImageUrlPrefix: string;
    staticFilesUrlPrefix: string;
    staticMediaUrlPrefix: string;
    cardTransformers?: MobiledocCardTransformer[];
}

interface UrlUtilsOptions {
    getSubdir?: () => string;
    getSiteUrl?: () => string;
    getAdminUrl?: () => string;
    baseApiPath?: string;
    defaultApiType?: 'content' | 'admin';
    slugs?: {
        reserved?: string[];
        protected?: string[];
    } | null;
    redirectCacheMaxAge?: number | null;
    staticImageUrlPrefix?: string;
    staticFilesUrlPrefix?: string;
    staticMediaUrlPrefix?: string;
    assetBaseUrls?: {
        image?: string | null;
        files?: string | null;
        media?: string | null;
    };
    cardTransformers?: MobiledocCardTransformer[];
}

// similar to Object.assign but will not override defaults if a source value is undefined
function assignOptions<T extends Record<string, unknown>>(target: T, ...sources: Array<Record<string, unknown>>): T {
    const options = sources.map((x) => {
        return Object.entries(x)
            .filter(([, value]) => value !== undefined)
            .reduce((obj, [key, value]) => (obj[key] = value, obj), {} as Record<string, unknown>);
    });
    return Object.assign(target, ...options) as T;
}

export default class UrlUtils {
    private _config: UrlUtilsConfig;
    private _assetBaseUrls: AssetBaseUrls;
    public getSubdir: () => string;
    public getSiteUrl: () => string;
    public getAdminUrl: () => string;

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
     * @param {String} [options.staticFilesUrlPrefix='content/files'] static prefix for serving files. Should not be passed in, unless customizing ghost instance file storage
     * @param {String} [options.staticMediaUrlPrefix='content/media'] static prefix for serving media. Should not be passed in, unless customizing ghost instance media storage
     * @param {object} [options.assetBaseUrls] asset CDN base URLs
     * @param {string} [options.assetBaseUrls.image] image asset CDN base URL
     * @param {string} [options.assetBaseUrls.files] files asset CDN base URL
     * @param {string} [options.assetBaseUrls.media] media asset CDN base URL
     */
    constructor(options: UrlUtilsOptions = {}) {
        const defaultOptions: UrlUtilsConfig = {
            slugs: null,
            redirectCacheMaxAge: null,
            baseApiPath: '/ghost/api',
            defaultApiType: 'content',
            staticImageUrlPrefix: 'content/images',
            staticFilesUrlPrefix: 'content/files',
            staticMediaUrlPrefix: 'content/media'
        };

        this._config = Object.assign({}, defaultOptions, options) as UrlUtilsConfig;

        const assetBaseUrls = options.assetBaseUrls || {};
        this._assetBaseUrls = {
            image: assetBaseUrls.image || null,
            files: assetBaseUrls.files || null,
            media: assetBaseUrls.media || null
        };

        this.getSubdir = options.getSubdir || (() => '');
        this.getSiteUrl = options.getSiteUrl || (() => '');
        this.getAdminUrl = options.getAdminUrl || (() => '');
    }

    private _assetOptionDefaults(): BaseUrlOptionsInput & {
        staticImageUrlPrefix: string;
        staticFilesUrlPrefix: string;
        staticMediaUrlPrefix: string;
        } {
        return {
            staticImageUrlPrefix: this._config.staticImageUrlPrefix,
            staticFilesUrlPrefix: this._config.staticFilesUrlPrefix,
            staticMediaUrlPrefix: this._config.staticMediaUrlPrefix,
            imageBaseUrl: this._assetBaseUrls.image || null,
            filesBaseUrl: this._assetBaseUrls.files || null,
            mediaBaseUrl: this._assetBaseUrls.media || null
        };
    }

    private _buildAssetOptions(additionalDefaults: Record<string, unknown> = {}, options?: Record<string, unknown>): Record<string, unknown> {
        return assignOptions({}, this._assetOptionDefaults(), additionalDefaults, options || {});
    }

    getProtectedSlugs(): string[] {
        const subDir = this.getSubdir();

        if (!_.isEmpty(subDir)) {
            const lastSegment = subDir.split('/').pop();
            if (this._config.slugs && lastSegment) {
                return this._config.slugs.concat([lastSegment]);
            }
            return lastSegment ? [lastSegment] : [];
        } else {
            return this._config.slugs || [];
        }
    }

    /** urlJoin
     * Returns a URL/path for internal use in Ghost.
     * @param {string} arguments takes arguments and concats those to a valid path/URL.
     * @return {string} URL concatinated URL/path of arguments.
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
        let base: string;

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
    urlFor(context: string | {relativeUrl: string} | {image?: string} | {nav?: {url: string}}, data?: Record<string, unknown> | boolean | {trailingSlash?: boolean; type?: 'admin' | 'content'} | null, absolute?: boolean): string {
        let urlPath: string = '/';
        let imagePathRe: RegExp | undefined;
        const knownObjects: string[] = ['image', 'nav'];
        let baseUrl: string | undefined;
        let hostname: string | undefined;

        // this will become really big
        const knownPaths: Record<string, string> = {
            home: '/',
            sitemap_xsl: '/sitemap.xsl'
        };

        // Make data properly optional
        if (_.isBoolean(data)) {
            absolute = data;
            data = null;
        }

        if (_.isObject(context) && !_.isArray(context) && 'relativeUrl' in context && typeof (context as {relativeUrl: string}).relativeUrl === 'string') {
            const relativeUrl = (context as {relativeUrl: string}).relativeUrl;
            urlPath = relativeUrl || '/';
        } else if (_.isString(context) && _.indexOf(knownObjects, context) !== -1) {
            if (context === 'image' && data && typeof data === 'object' && !_.isArray(data) && 'image' in data && typeof data.image === 'string') {
                urlPath = data.image as string;
                imagePathRe = new RegExp('^' + this.getSubdir() + '/' + this._config.staticImageUrlPrefix);
                absolute = imagePathRe.test(urlPath) ? (absolute || false) : false;

                if (absolute) {
                    // Remove the sub-directory from the URL because ghostConfig will add it back.
                    urlPath = urlPath.replace(new RegExp('^' + this.getSubdir()), '');
                    baseUrl = this.getSiteUrl().replace(/\/$/, '');
                    urlPath = baseUrl + urlPath;
                }

                return urlPath;
            } else if (context === 'nav' && data && typeof data === 'object' && !_.isArray(data) && 'nav' in data && data.nav && typeof data.nav === 'object' && !_.isArray(data.nav) && 'url' in data.nav && typeof data.nav.url === 'string') {
                urlPath = (data.nav as {url: string}).url;
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
            if (data && typeof data === 'object' && !_.isArray(data) && 'trailingSlash' in data && data.trailingSlash === false) {
                urlPath = urlPath.replace(/\/$/, '');
            }
        } else if (context === 'admin') {
            const adminUrl = this.getAdminUrl() || this.getSiteUrl();
            let adminPath = '/ghost/';

            if (absolute) {
                urlPath = this.urlJoin(adminUrl, adminPath);
            } else {
                urlPath = adminPath;
            }
        } else if (context === 'api') {
            const adminUrl = this.getAdminUrl() || this.getSiteUrl();
            let apiPath = this._config.baseApiPath + '/';

            if (data && typeof data === 'object' && !_.isArray(data) && 'type' in data && typeof data.type === 'string' && ['admin', 'content'].includes(data.type)) {
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

    redirect301(res: ExpressResponse, redirectUrl: string): void {
        res.set({'Cache-Control': 'public, max-age=' + this._config.redirectCacheMaxAge});
        res.redirect(301, redirectUrl);
    }

    redirectToAdmin(status: number, res: ExpressResponse, adminPath: string): void {
        const redirectUrl = this.urlJoin(this.urlFor('admin', true), adminPath, '/');

        if (status === 301) {
            this.redirect301(res, redirectUrl);
        } else {
            res.redirect(redirectUrl);
        }
    }

    absoluteToRelative(url: string, options?: AbsoluteToRelativeOptionsInput): string {
        return utils.absoluteToRelative(url, this.getSiteUrl(), options);
    }

    relativeToAbsolute(url: string, options?: RelativeToAbsoluteOptionsInput): string {
        // Original code passes options as third parameter (itemPath), preserving that behavior
        return utils.relativeToAbsolute(url, this.getSiteUrl(), options || null, undefined);
    }

    toTransformReady(url: string, itemPath: string | null | ToTransformReadyOptions, options?: ToTransformReadyOptions): string {
        let finalItemPath: string | null = null;
        let finalOptions: ToTransformReadyOptions | undefined = options;

        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            finalOptions = itemPath as ToTransformReadyOptions;
            finalItemPath = null;
        } else if (typeof itemPath === 'string') {
            finalItemPath = itemPath;
        }
        const _options = this._buildAssetOptions({}, finalOptions) as ToTransformReadyOptions;
        return utils.toTransformReady(url, this.getSiteUrl(), finalItemPath, _options);
    }

    absoluteToTransformReady(url: string, options?: AbsoluteToTransformReadyOptionsInputType): string {
        const _options = this._buildAssetOptions({}, options) as AbsoluteToTransformReadyOptionsInputType;
        return utils.absoluteToTransformReady(url, this.getSiteUrl(), _options);
    }

    relativeToTransformReady(url: string, options?: RelativeToTransformReadyOptionsInputType): string {
        const _options = this._buildAssetOptions({}, options) as RelativeToTransformReadyOptionsInputType;
        return utils.relativeToTransformReady(url, this.getSiteUrl(), _options);
    }

    transformReadyToAbsolute(url: string, options?: TransformReadyToAbsoluteOptionsInput): string {
        const _options = this._buildAssetOptions({}, options) as TransformReadyToAbsoluteOptionsInput;
        return utils.transformReadyToAbsolute(url, this.getSiteUrl(), _options);
    }

    transformReadyToRelative(url: string, options?: TransformReadyToRelativeOptionsInput): string {
        const _options = this._buildAssetOptions({}, options) as TransformReadyToRelativeOptionsInput;
        return utils.transformReadyToRelative(url, this.getSiteUrl(), _options);
    }

    htmlToTransformReady(html: string, itemPath: string | null | HtmlTransformOptionsInput, options?: HtmlTransformOptionsInput): string {
        let finalItemPath: string | null = null;
        let finalOptions: HtmlTransformOptionsInput | undefined = options;

        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            finalOptions = itemPath;
            finalItemPath = null;
        } else if (typeof itemPath === 'string') {
            finalItemPath = itemPath;
        }
        const _options = this._buildAssetOptions({}, finalOptions) as HtmlTransformOptionsInput;
        return utils.htmlToTransformReady(html, this.getSiteUrl(), finalItemPath, _options);
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
    htmlRelativeToAbsolute(html: string, itemPath: string | null | HtmlTransformOptionsInput, options?: HtmlTransformOptionsInput): string {
        let finalItemPath: string | null = null;
        let finalOptions: HtmlTransformOptionsInput | undefined = options;

        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            finalOptions = itemPath;
            finalItemPath = null;
        } else if (typeof itemPath === 'string') {
            finalItemPath = itemPath;
        }
        const _options = this._buildAssetOptions({
            assetsOnly: false
        }, finalOptions) as HtmlTransformOptionsInput;
        return utils.htmlRelativeToAbsolute(html, this.getSiteUrl(), finalItemPath, _options);
    }

    htmlRelativeToTransformReady(html: string, itemPath: string | null | RelativeToTransformReadyOptionsInputType, options?: RelativeToTransformReadyOptionsInputType): string {
        let finalItemPath: string | null = null;
        let finalOptions: RelativeToTransformReadyOptionsInputType | undefined = options;

        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            finalOptions = itemPath;
            finalItemPath = null;
        } else if (typeof itemPath === 'string') {
            finalItemPath = itemPath;
        }
        const _options = this._buildAssetOptions({
            assetsOnly: false
        }, finalOptions) as RelativeToTransformReadyOptionsInputType;
        return utils.htmlRelativeToTransformReady(html, this.getSiteUrl(), finalItemPath, _options);
    }

    htmlAbsoluteToRelative(html: string, options: HtmlTransformOptionsInput = {}): string {
        const _options = this._buildAssetOptions({
            assetsOnly: false
        }, options) as HtmlTransformOptionsInput;
        return utils.htmlAbsoluteToRelative(html, this.getSiteUrl(), _options);
    }

    htmlAbsoluteToTransformReady(html: string, options: AbsoluteToTransformReadyOptionsInputType = {}): string {
        const _options = this._buildAssetOptions({
            assetsOnly: false
        }, options) as AbsoluteToTransformReadyOptionsInputType;
        return utils.htmlAbsoluteToTransformReady(html, this.getSiteUrl(), _options);
    }

    markdownToTransformReady(markdown: string, itemPath: string | null | MarkdownTransformOptionsInput, options?: MarkdownTransformOptionsInput): string {
        let finalItemPath: string | null = null;
        let finalOptions: MarkdownTransformOptionsInput | undefined = options;

        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            finalOptions = itemPath;
            finalItemPath = null;
        } else if (typeof itemPath === 'string') {
            finalItemPath = itemPath;
        }
        const _options = this._buildAssetOptions({}, finalOptions) as MarkdownTransformOptionsInput;
        return utils.markdownToTransformReady(markdown, this.getSiteUrl(), finalItemPath, _options);
    }

    markdownRelativeToAbsolute(markdown: string, itemPath: string | null | MarkdownTransformOptionsInput, options?: MarkdownTransformOptionsInput): string {
        let finalItemPath: string | null = null;
        let finalOptions: MarkdownTransformOptionsInput | undefined = options;

        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            finalOptions = itemPath;
            finalItemPath = null;
        } else if (typeof itemPath === 'string') {
            finalItemPath = itemPath;
        }
        const _options = this._buildAssetOptions({
            assetsOnly: false
        }, finalOptions) as MarkdownTransformOptionsInput;
        return utils.markdownRelativeToAbsolute(markdown, this.getSiteUrl(), finalItemPath, _options);
    }

    markdownRelativeToTransformReady(markdown: string, itemPath: string | null | MarkdownTransformOptionsInput, options?: MarkdownTransformOptionsInput): string {
        let finalItemPath: string | null = null;
        let finalOptions: MarkdownTransformOptionsInput | undefined = options;

        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            finalOptions = itemPath;
            finalItemPath = null;
        } else if (typeof itemPath === 'string') {
            finalItemPath = itemPath;
        }
        const _options = this._buildAssetOptions({
            assetsOnly: false
        }, finalOptions) as MarkdownTransformOptionsInput;
        return utils.markdownRelativeToTransformReady(markdown, this.getSiteUrl(), finalItemPath, _options);
    }

    markdownAbsoluteToRelative(markdown: string, options: MarkdownTransformOptionsInput = {}): string {
        const _options = this._buildAssetOptions({
            assetsOnly: false
        }, options) as MarkdownTransformOptionsInput;
        return utils.markdownAbsoluteToRelative(markdown, this.getSiteUrl(), _options);
    }

    markdownAbsoluteToTransformReady(markdown: string, options: AbsoluteToTransformReadyOptionsInputType = {}): string {
        const _options = this._buildAssetOptions({
            assetsOnly: false
        }, options) as AbsoluteToTransformReadyOptionsInputType;
        return utils.markdownAbsoluteToTransformReady(markdown, this.getSiteUrl(), _options);
    }

    mobiledocToTransformReady(serializedMobiledoc: string, itemPath: string | null | MobiledocTransformOptionsInput, options?: MobiledocTransformOptionsInput): string {
        let finalItemPath: string | null = null;
        let finalOptions: MobiledocTransformOptionsInput | undefined = options;

        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            finalOptions = itemPath;
            finalItemPath = null;
        } else if (typeof itemPath === 'string') {
            finalItemPath = itemPath;
        }
        const _options = this._buildAssetOptions({
            cardTransformers: this._config.cardTransformers
        }, finalOptions) as MobiledocTransformOptionsInput;
        return utils.mobiledocToTransformReady(serializedMobiledoc, this.getSiteUrl(), finalItemPath, _options);
    }

    mobiledocRelativeToAbsolute(serializedMobiledoc: string, itemPath: string | null | MobiledocTransformOptionsInput, options?: MobiledocTransformOptionsInput): string {
        let finalItemPath: string | null = null;
        let finalOptions: MobiledocTransformOptionsInput | undefined = options;

        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            finalOptions = itemPath;
            finalItemPath = null;
        } else if (typeof itemPath === 'string') {
            finalItemPath = itemPath;
        }
        const _options = this._buildAssetOptions({
            assetsOnly: false,
            cardTransformers: this._config.cardTransformers
        }, finalOptions) as MobiledocTransformOptionsInput;
        return utils.mobiledocRelativeToAbsolute(serializedMobiledoc, this.getSiteUrl(), finalItemPath, _options);
    }

    mobiledocRelativeToTransformReady(serializedMobiledoc: string, itemPath: string | null | MobiledocTransformOptionsInput, options?: MobiledocTransformOptionsInput): string {
        let finalItemPath: string | null = null;
        let finalOptions: MobiledocTransformOptionsInput | undefined = options;

        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            finalOptions = itemPath;
            finalItemPath = null;
        } else if (typeof itemPath === 'string') {
            finalItemPath = itemPath;
        }
        const _options = this._buildAssetOptions({
            assetsOnly: false,
            cardTransformers: this._config.cardTransformers
        }, finalOptions) as MobiledocTransformOptionsInput;
        return utils.mobiledocRelativeToTransformReady(serializedMobiledoc, this.getSiteUrl(), finalItemPath, _options);
    }

    mobiledocAbsoluteToRelative(serializedMobiledoc: string, options: MobiledocTransformOptionsInput = {}): string {
        const _options = this._buildAssetOptions({
            assetsOnly: false,
            cardTransformers: this._config.cardTransformers
        }, options) as MobiledocTransformOptionsInput;
        return utils.mobiledocAbsoluteToRelative(serializedMobiledoc, this.getSiteUrl(), _options);
    }

    mobiledocAbsoluteToTransformReady(serializedMobiledoc: string, options: MobiledocTransformOptionsInput = {}): string {
        const _options = this._buildAssetOptions({
            assetsOnly: false,
            cardTransformers: this._config.cardTransformers
        }, options) as MobiledocTransformOptionsInput;
        return utils.mobiledocAbsoluteToTransformReady(serializedMobiledoc, this.getSiteUrl(), _options);
    }

    lexicalToTransformReady(serializedLexical: string, itemPath: string | null | LexicalTransformOptionsInput, options?: LexicalTransformOptionsInput): string {
        let finalItemPath: string | null = null;
        let finalOptions: LexicalTransformOptionsInput | undefined = options;

        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            finalOptions = itemPath;
            finalItemPath = null;
        } else if (typeof itemPath === 'string') {
            finalItemPath = itemPath;
        }
        const _options = this._buildAssetOptions({
            cardTransformers: this._config.cardTransformers
        }, finalOptions) as LexicalTransformOptionsInput;
        return utils.lexicalToTransformReady(serializedLexical, this.getSiteUrl(), finalItemPath, _options);
    }

    lexicalRelativeToAbsolute(serializedLexical: string, itemPath: string | null | LexicalTransformOptionsInput, options?: LexicalTransformOptionsInput): string {
        let finalItemPath: string | null = null;
        let finalOptions: LexicalTransformOptionsInput | undefined = options;

        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            finalOptions = itemPath;
            finalItemPath = null;
        } else if (typeof itemPath === 'string') {
            finalItemPath = itemPath;
        }
        const _options = this._buildAssetOptions({
            assetsOnly: false,
            cardTransformers: this._config.cardTransformers
        }, finalOptions) as LexicalTransformOptionsInput;
        return utils.lexicalRelativeToAbsolute(serializedLexical, this.getSiteUrl(), finalItemPath, _options);
    }

    lexicalRelativeToTransformReady(serializedLexical: string, itemPath: string | null | LexicalTransformOptionsInput, options?: LexicalTransformOptionsInput): string {
        let finalItemPath: string | null = null;
        let finalOptions: LexicalTransformOptionsInput | undefined = options;

        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            finalOptions = itemPath;
            finalItemPath = null;
        } else if (typeof itemPath === 'string') {
            finalItemPath = itemPath;
        }
        const _options = this._buildAssetOptions({
            assetsOnly: false,
            cardTransformers: this._config.cardTransformers
        }, finalOptions) as LexicalTransformOptionsInput;
        return utils.lexicalRelativeToTransformReady(serializedLexical, this.getSiteUrl(), finalItemPath, _options);
    }

    lexicalAbsoluteToRelative(serializedLexical: string, options: LexicalTransformOptionsInput = {}): string {
        const _options = this._buildAssetOptions({
            assetsOnly: false,
            cardTransformers: this._config.cardTransformers
        }, options) as LexicalTransformOptionsInput;
        return utils.lexicalAbsoluteToRelative(serializedLexical, this.getSiteUrl(), _options);
    }

    lexicalAbsoluteToTransformReady(serializedLexical: string, options: LexicalTransformOptionsInput = {}): string {
        const _options = this._buildAssetOptions({
            assetsOnly: false,
            cardTransformers: this._config.cardTransformers
        }, options) as LexicalTransformOptionsInput;
        return utils.lexicalAbsoluteToTransformReady(serializedLexical, this.getSiteUrl(), _options);
    }

    plaintextToTransformReady(plaintext: string, options: Record<string, unknown> = {}): string {
        const _options = this._buildAssetOptions({}, options);
        return utils.plaintextToTransformReady(plaintext, this.getSiteUrl(), null, _options);
    }

    /**
     * Return whether the provided URL is part of the site (checks if same domain and within subdirectory)
     * @param {URL} url
     * @param {string} [context] describing the context for which you need to check a url
     * @returns {boolean}
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

    get STATIC_FILES_URL_PREFIX(): string {
        return this._config.staticFilesUrlPrefix;
    }

    get STATIC_MEDIA_URL_PREFIX(): string {
        return this._config.staticMediaUrlPrefix;
    }

    // expose underlying functions to ease testing
    get _utils(): typeof utils {
        return utils;
    }
};
