import _ from 'lodash';
import utils from './utils';
import type {AbsoluteToRelativeOptionsInput} from './utils/absolute-to-relative';
import type {AbsoluteToTransformReadyOptionsInput} from './utils/absolute-to-transform-ready';
import type {RelativeToAbsoluteOptionsInput} from './utils/relative-to-absolute';
import type {RelativeToTransformReadyOptionsInput} from './utils/relative-to-transform-ready';
import type {HtmlRelativeToAbsoluteOptionsInput} from './utils/html-relative-to-absolute';
import type {HtmlRelativeToTransformReadyOptionsInput} from './utils/html-relative-to-transform-ready';
import type {HtmlAbsoluteToRelativeOptionsInput} from './utils/html-absolute-to-relative';
import type {HtmlAbsoluteToTransformReadyOptionsInput} from './utils/html-absolute-to-transform-ready';
import type {MarkdownRelativeToAbsoluteOptionsInput} from './utils/markdown-relative-to-absolute';
import type {MarkdownRelativeToTransformReadyOptionsInput} from './utils/markdown-relative-to-transform-ready';
import type {MarkdownAbsoluteToRelativeOptionsInput} from './utils/markdown-absolute-to-relative';
import type {MarkdownAbsoluteToTransformReadyOptionsInput} from './utils/markdown-absolute-to-transform-ready';
import type {MarkdownToTransformReadyOptions} from './utils/markdown-to-transform-ready';
import type {MobiledocRelativeToAbsoluteOptions} from './utils/mobiledoc-relative-to-absolute';
import type {MobiledocRelativeToTransformReadyOptions} from './utils/mobiledoc-relative-to-transform-ready';
import type {MobiledocAbsoluteToRelativeOptions} from './utils/mobiledoc-absolute-to-relative';
import type {MobiledocAbsoluteToTransformReadyOptions} from './utils/mobiledoc-absolute-to-transform-ready';
import type {MobiledocToTransformReadyOptions} from './utils/mobiledoc-to-transform-ready';
import type {LexicalRelativeToAbsoluteOptions} from './utils/lexical-relative-to-absolute';
import type {LexicalRelativeToTransformReadyOptions} from './utils/lexical-relative-to-transform-ready';
import type {LexicalAbsoluteToRelativeOptions} from './utils/lexical-absolute-to-relative';
import type {LexicalAbsoluteToTransformReadyOptions} from './utils/lexical-absolute-to-transform-ready';
import type {LexicalToTransformReadyOptions} from './utils/lexical-to-transform-ready';
import type {PlaintextToTransformReadyOptions} from './utils/plaintext-to-transform-ready';
import type {TransformReadyReplacementOptionsInput, MobiledocCardTransformer} from './utils/types';
import type {ToTransformReadyOptions} from './utils/to-transform-ready';

const KNOWN_PATHS: Record<string, string> = {
    home: '/',
    sitemap_xsl: '/sitemap.xsl'
};

type UrlGetter = () => string;

interface UrlUtilsConfig extends Record<string, unknown> {
    slugs: string[] | null;
    redirectCacheMaxAge: number | null;
    baseApiPath: string;
    defaultApiType: 'content' | 'admin';
    staticImageUrlPrefix: string;
    cardTransformers?: MobiledocCardTransformer[];
}

interface UrlUtilsOptions extends Partial<UrlUtilsConfig> {
    getSubdir?: UrlGetter;
    getSiteUrl?: UrlGetter;
    getAdminUrl?: UrlGetter;
}

interface RedirectResponse {
    set(headers: Record<string, string>): unknown;
    redirect(status: number, url: string): unknown;
    redirect(url: string): unknown;
}

type UrlForContext = string | Record<string, unknown>;

interface UrlForNav {
    url: string;
}

interface UrlForData {
    image?: string;
    nav?: UrlForNav;
    type?: 'admin' | 'content';
    trailingSlash?: boolean;
    [key: string]: unknown;
}

function assignOptions<T extends Record<string, unknown>>(target: T, ...sources: Array<Partial<T> | undefined | null>): T {
    for (const source of sources) {
        if (!source) {
            continue;
        }

        for (const [key, value] of Object.entries(source) as Array<[keyof T, T[keyof T]]>) {
            if (value !== undefined) {
                target[key] = value;
            }
        }
    }

    return target;
}

function sanitizedMerge<T extends Record<string, unknown>>(defaults: T, overrides?: Partial<T>): T {
    return assignOptions({...defaults}, overrides);
}

export default class UrlUtils {
    private _config: UrlUtilsConfig;
    public getSubdir: UrlGetter;
    public getSiteUrl: UrlGetter;
    public getAdminUrl: UrlGetter;

    constructor(options: UrlUtilsOptions = {}) {
        const defaultOptions: UrlUtilsConfig = {
            slugs: null,
            redirectCacheMaxAge: null,
            baseApiPath: '/ghost/api',
            defaultApiType: 'content',
            staticImageUrlPrefix: 'content/images'
        };

        const configOverrides: Partial<UrlUtilsConfig> = {
            slugs: options.slugs,
            redirectCacheMaxAge: options.redirectCacheMaxAge,
            baseApiPath: options.baseApiPath,
            defaultApiType: options.defaultApiType,
            staticImageUrlPrefix: options.staticImageUrlPrefix,
            cardTransformers: options.cardTransformers
        };

        this._config = sanitizedMerge(defaultOptions, configOverrides);

        this.getSubdir = options.getSubdir ?? (() => '');
        this.getSiteUrl = options.getSiteUrl ?? (() => '');
        this.getAdminUrl = options.getAdminUrl ?? (() => '');
    }

    getProtectedSlugs(): string[] | null {
        const subDir = this.getSubdir();

        if (this._config.slugs && !_.isEmpty(subDir)) {
            const parts = subDir.split('/');
            const lastPart = parts[parts.length - 1];
            return this._config.slugs.concat(lastPart ? [lastPart] : []);
        }

        return this._config.slugs;
    }

    urlJoin(...parts: string[]): string {
        return utils.urlJoin(parts, {rootUrl: this.getSiteUrl()});
    }

    createUrl(urlPath: string = '/', absolute = false, trailingSlash?: boolean): string {
        let base: string;

        if (absolute) {
            base = this.getSiteUrl();
        } else {
            base = this.getSubdir();
        }

        let finalPath = urlPath;
        if (trailingSlash) {
            if (!finalPath.endsWith('/')) {
                finalPath += '/';
            }
        }

        return this.urlJoin(base, finalPath);
    }

    urlFor(context: UrlForContext, data?: UrlForData | boolean, absolute?: boolean): string {
        let urlPath = '/';
        const knownObjects = ['image', 'nav'];
        let absoluteFlag = Boolean(absolute);
        let dataObj: UrlForData | undefined;

        if (typeof data === 'boolean') {
            absoluteFlag = data;
            dataObj = undefined;
        } else if (data && typeof data === 'object') {
            dataObj = data;
        }

        if (typeof context === 'object' && context !== null) {
            const relativeUrl = (context as {relativeUrl?: unknown}).relativeUrl;
            if (typeof relativeUrl === 'string' && relativeUrl) {
                urlPath = relativeUrl;
            }
        } else if (typeof context === 'string' && knownObjects.includes(context)) {
            if (context === 'image' && dataObj?.image) {
                urlPath = dataObj.image;
                const imagePathRe = new RegExp('^' + this.getSubdir() + '/' + this._config.staticImageUrlPrefix);
                absoluteFlag = imagePathRe.test(dataObj.image) ? absoluteFlag : false;

                if (absoluteFlag) {
                    urlPath = urlPath.replace(new RegExp('^' + this.getSubdir()), '');
                    const baseUrl = this.getSiteUrl().replace(/\/$/, '');
                    urlPath = baseUrl + urlPath;
                }

                return urlPath;
            }

            if (context === 'nav' && dataObj?.nav) {
                urlPath = dataObj.nav.url;
                const baseUrl = this.getSiteUrl();
                const hostname = baseUrl.split('//')[1];

                if (hostname) {
                    const prefix = urlPath.split(hostname)[0];
                    const suffix = urlPath.split(hostname)[1] ?? '';
                    const isSubdomain = prefix.match(/\.|mailto:/);
                    const hasPort = suffix.startsWith(':');

                    if (urlPath.includes(hostname) && !isSubdomain && !hasPort) {
                        const stripped = urlPath.split(hostname)[1];
                        urlPath = this.urlJoin('/', stripped);
                        absoluteFlag = true;
                    }
                }
            }
        } else if (context === 'home' && absoluteFlag) {
            urlPath = this.getSiteUrl();

            if (dataObj && dataObj.trailingSlash === false) {
                urlPath = urlPath.replace(/\/$/, '');
            }
        } else if (context === 'admin') {
            const adminUrl = this.getAdminUrl() || this.getSiteUrl();
            const adminPath = '/ghost/';

            if (absoluteFlag) {
                urlPath = this.urlJoin(adminUrl, adminPath);
            } else {
                urlPath = adminPath;
            }
        } else if (context === 'api') {
            const adminUrl = this.getAdminUrl() || this.getSiteUrl();
            let apiPath = `${this._config.baseApiPath}/`;

            if (dataObj?.type && ['admin', 'content'].includes(dataObj.type)) {
                apiPath += dataObj.type;
            } else {
                apiPath += this._config.defaultApiType;
            }

            apiPath += '/';

            if (absoluteFlag) {
                urlPath = this.urlJoin(adminUrl, apiPath);
            } else {
                urlPath = apiPath;
            }
        } else if (typeof context === 'string' && Object.prototype.hasOwnProperty.call(KNOWN_PATHS, context)) {
            urlPath = KNOWN_PATHS[context];
        }

        const hasProtocol = urlPath.includes('://');
        const isSpecial = /^(\/\/|#|[a-zA-Z0-9-]+:)/.test(urlPath);
        if (urlPath && (hasProtocol || isSpecial)) {
            return urlPath;
        }

        return this.createUrl(urlPath, absoluteFlag);
    }

    redirect301(res: RedirectResponse, redirectUrl: string) {
        if (this._config.redirectCacheMaxAge !== null) {
            res.set({
                'Cache-Control': `public, max-age=${this._config.redirectCacheMaxAge}`
            });
        }

        return res.redirect(301, redirectUrl);
    }

    redirectToAdmin(status: number, res: RedirectResponse, adminPath: string) {
        const redirectUrl = this.urlJoin(this.urlFor('admin', true), adminPath, '/');

        if (status === 301) {
            return this.redirect301(res, redirectUrl);
        }

        return typeof res.redirect === 'function' ? res.redirect(redirectUrl) : undefined;
    }

    absoluteToRelative(url: string, options?: AbsoluteToRelativeOptionsInput): string {
        return utils.absoluteToRelative(url, this.getSiteUrl(), options);
    }

    relativeToAbsolute(url: string, options?: RelativeToAbsoluteOptionsInput): string {
        return utils.relativeToAbsolute(url, this.getSiteUrl(), options);
    }

    toTransformReady(url: string, itemPath?: string | ToTransformReadyOptions, options?: ToTransformReadyOptions): string {
        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            options = itemPath;
            itemPath = null;
        }
        return utils.toTransformReady(url, this.getSiteUrl(), itemPath ?? null, options);
    }

    absoluteToTransformReady(url: string, options?: AbsoluteToTransformReadyOptionsInput): string {
        return utils.absoluteToTransformReady(url, this.getSiteUrl(), options);
    }

    relativeToTransformReady(url: string, options?: RelativeToTransformReadyOptionsInput): string {
        const defaultOptions: RelativeToTransformReadyOptionsInput = {
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const mergedOptions = sanitizedMerge(defaultOptions, options ?? undefined);
        return utils.relativeToTransformReady(url, this.getSiteUrl(), mergedOptions);
    }

    transformReadyToAbsolute(url: string, options?: TransformReadyReplacementOptionsInput): string {
        return utils.transformReadyToAbsolute(url, this.getSiteUrl(), options);
    }

    transformReadyToRelative(url: string, options?: TransformReadyReplacementOptionsInput): string {
        return utils.transformReadyToRelative(url, this.getSiteUrl(), options);
    }

    htmlToTransformReady(html: string, itemPath?: string | HtmlRelativeToTransformReadyOptionsInput, options?: HtmlRelativeToTransformReadyOptionsInput): string {
        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            options = itemPath;
            itemPath = null;
        }
        return utils.htmlToTransformReady(html, this.getSiteUrl(), itemPath ?? null, options);
    }

    htmlRelativeToAbsolute(html: string, itemPath?: string | HtmlRelativeToAbsoluteOptionsInput, options?: HtmlRelativeToAbsoluteOptionsInput): string {
        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            options = itemPath;
            itemPath = null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const mergedOptions = sanitizedMerge(defaultOptions, options ?? undefined);
        return utils.htmlRelativeToAbsolute(html, this.getSiteUrl(), itemPath ?? null, mergedOptions);
    }

    htmlRelativeToTransformReady(html: string, itemPath?: string | HtmlRelativeToTransformReadyOptionsInput, options?: HtmlRelativeToTransformReadyOptionsInput): string {
        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            options = itemPath;
            itemPath = null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const mergedOptions = sanitizedMerge(defaultOptions, options ?? undefined);
        return utils.htmlRelativeToTransformReady(html, this.getSiteUrl(), itemPath ?? null, mergedOptions);
    }

    htmlAbsoluteToRelative(html: string, options: HtmlAbsoluteToRelativeOptionsInput = {}): string {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const mergedOptions = sanitizedMerge(defaultOptions, options);
        return utils.htmlAbsoluteToRelative(html, this.getSiteUrl(), mergedOptions);
    }

    htmlAbsoluteToTransformReady(html: string, options: HtmlAbsoluteToTransformReadyOptionsInput = {}): string {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const mergedOptions = sanitizedMerge(defaultOptions, options);
        return utils.htmlAbsoluteToTransformReady(html, this.getSiteUrl(), mergedOptions);
    }

    markdownToTransformReady(markdown: string, itemPath?: string | MarkdownToTransformReadyOptions, options?: MarkdownToTransformReadyOptions): string {
        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            options = itemPath;
            itemPath = null;
        }
        return utils.markdownToTransformReady(markdown, this.getSiteUrl(), itemPath ?? null, options);
    }

    markdownRelativeToAbsolute(markdown: string, itemPath?: string | MarkdownRelativeToAbsoluteOptionsInput, options?: MarkdownRelativeToAbsoluteOptionsInput): string {
        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            options = itemPath;
            itemPath = null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const mergedOptions = sanitizedMerge(defaultOptions, options ?? undefined);
        return utils.markdownRelativeToAbsolute(markdown, this.getSiteUrl(), itemPath ?? null, mergedOptions);
    }

    markdownRelativeToTransformReady(markdown: string, itemPath?: string | MarkdownRelativeToTransformReadyOptionsInput, options?: MarkdownRelativeToTransformReadyOptionsInput): string {
        if (typeof itemPath === 'object' && itemPath !== null && !options) {
            options = itemPath;
            itemPath = null;
        }
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const mergedOptions = sanitizedMerge(defaultOptions, options ?? undefined);
        return utils.markdownRelativeToTransformReady(markdown, this.getSiteUrl(), itemPath ?? null, mergedOptions);
    }

    markdownAbsoluteToRelative(markdown: string, options: MarkdownAbsoluteToRelativeOptionsInput = {}): string {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const mergedOptions = sanitizedMerge(defaultOptions, options);
        return utils.markdownAbsoluteToRelative(markdown, this.getSiteUrl(), mergedOptions);
    }

    markdownAbsoluteToTransformReady(markdown: string, options: MarkdownAbsoluteToTransformReadyOptionsInput = {}): string {
        const defaultOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const mergedOptions = sanitizedMerge(defaultOptions, options);
        return utils.markdownAbsoluteToTransformReady(markdown, this.getSiteUrl(), mergedOptions);
    }

    mobiledocToTransformReady(serializedMobiledoc: string, itemPath?: string | MobiledocToTransformReadyOptions, options?: MobiledocToTransformReadyOptions): string {
        let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
        let resolvedOptions = options;

        if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
            resolvedOptions = itemPath;
        }
        const defaultOptions: MobiledocToTransformReadyOptions = {};
        if (this._config.cardTransformers) {
            defaultOptions.cardTransformers = this._config.cardTransformers;
        }
        const mergedOptions = sanitizedMerge(defaultOptions, resolvedOptions ?? undefined);
        return utils.mobiledocToTransformReady(serializedMobiledoc, this.getSiteUrl(), resolvedItemPath, mergedOptions);
    }

    mobiledocRelativeToAbsolute(serializedMobiledoc: string, itemPath?: string | MobiledocRelativeToAbsoluteOptions, options?: MobiledocRelativeToAbsoluteOptions): string {
        let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
        let resolvedOptions = options;

        if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
            resolvedOptions = itemPath;
        }
        const defaultOptions: MobiledocRelativeToAbsoluteOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        if (this._config.cardTransformers) {
            defaultOptions.cardTransformers = this._config.cardTransformers;
        }
        const mergedOptions = sanitizedMerge(defaultOptions, resolvedOptions ?? undefined);
        return utils.mobiledocRelativeToAbsolute(serializedMobiledoc, this.getSiteUrl(), resolvedItemPath, mergedOptions);
    }

    mobiledocRelativeToTransformReady(serializedMobiledoc: string, itemPath?: string | MobiledocRelativeToTransformReadyOptions, options?: MobiledocRelativeToTransformReadyOptions): string {
        let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
        let resolvedOptions = options;

        if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
            resolvedOptions = itemPath;
        }
        const defaultOptions: MobiledocRelativeToTransformReadyOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        if (this._config.cardTransformers) {
            defaultOptions.cardTransformers = this._config.cardTransformers;
        }
        const mergedOptions = sanitizedMerge(defaultOptions, resolvedOptions ?? undefined);
        return utils.mobiledocRelativeToTransformReady(serializedMobiledoc, this.getSiteUrl(), resolvedItemPath, mergedOptions);
    }

    mobiledocAbsoluteToRelative(serializedMobiledoc: string, options: MobiledocAbsoluteToRelativeOptions = {}): string {
        const defaultOptions: MobiledocAbsoluteToRelativeOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        if (this._config.cardTransformers) {
            defaultOptions.cardTransformers = this._config.cardTransformers;
        }
        const mergedOptions = sanitizedMerge(defaultOptions, options);
        return utils.mobiledocAbsoluteToRelative(serializedMobiledoc, this.getSiteUrl(), mergedOptions);
    }

    mobiledocAbsoluteToTransformReady(serializedMobiledoc: string, options: MobiledocAbsoluteToTransformReadyOptions = {}): string {
        const defaultOptions: MobiledocAbsoluteToTransformReadyOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        if (this._config.cardTransformers) {
            defaultOptions.cardTransformers = this._config.cardTransformers;
        }
        const mergedOptions = sanitizedMerge(defaultOptions, options);
        return utils.mobiledocAbsoluteToTransformReady(serializedMobiledoc, this.getSiteUrl(), mergedOptions);
    }

    lexicalToTransformReady(serializedLexical: string, itemPath?: string | LexicalToTransformReadyOptions, options?: LexicalToTransformReadyOptions): string {
        let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
        let resolvedOptions = options;

        if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
            resolvedOptions = itemPath;
        }
        const defaultOptions: LexicalToTransformReadyOptions = {};
        if (this._config.cardTransformers) {
            defaultOptions.cardTransformers = this._config.cardTransformers;
        }
        const mergedOptions = sanitizedMerge(defaultOptions, resolvedOptions ?? undefined);
        return utils.lexicalToTransformReady(serializedLexical, this.getSiteUrl(), resolvedItemPath, mergedOptions);
    }

    lexicalRelativeToAbsolute(serializedLexical: string, itemPath?: string | LexicalRelativeToAbsoluteOptions, options?: LexicalRelativeToAbsoluteOptions): string {
        let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
        let resolvedOptions = options;

        if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
            resolvedOptions = itemPath;
        }
        const defaultOptions: LexicalRelativeToAbsoluteOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        if (this._config.cardTransformers) {
            defaultOptions.cardTransformers = this._config.cardTransformers;
        }
        const mergedOptions = sanitizedMerge(defaultOptions, resolvedOptions ?? undefined);
        return utils.lexicalRelativeToAbsolute(serializedLexical, this.getSiteUrl(), resolvedItemPath, mergedOptions);
    }

    lexicalRelativeToTransformReady(serializedLexical: string, itemPath?: string | LexicalRelativeToTransformReadyOptions, options?: LexicalRelativeToTransformReadyOptions): string {
        let resolvedItemPath: string | null = typeof itemPath === 'string' ? itemPath : null;
        let resolvedOptions = options;

        if (typeof itemPath === 'object' && itemPath !== null && !resolvedOptions) {
            resolvedOptions = itemPath;
        }
        const defaultOptions: LexicalRelativeToTransformReadyOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        if (this._config.cardTransformers) {
            defaultOptions.cardTransformers = this._config.cardTransformers;
        }
        const mergedOptions = sanitizedMerge(defaultOptions, resolvedOptions ?? undefined);
        return utils.lexicalRelativeToTransformReady(serializedLexical, this.getSiteUrl(), resolvedItemPath, mergedOptions);
    }

    lexicalAbsoluteToRelative(serializedLexical: string, options: LexicalAbsoluteToRelativeOptions = {}): string {
        const defaultOptions: LexicalAbsoluteToRelativeOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        if (this._config.cardTransformers) {
            defaultOptions.cardTransformers = this._config.cardTransformers;
        }
        const mergedOptions = sanitizedMerge(defaultOptions, options);
        return utils.lexicalAbsoluteToRelative(serializedLexical, this.getSiteUrl(), mergedOptions);
    }

    lexicalAbsoluteToTransformReady(serializedLexical: string, options: LexicalAbsoluteToTransformReadyOptions = {}): string {
        const defaultOptions: LexicalAbsoluteToTransformReadyOptions = {
            assetsOnly: false,
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        if (this._config.cardTransformers) {
            defaultOptions.cardTransformers = this._config.cardTransformers;
        }
        const mergedOptions = sanitizedMerge(defaultOptions, options);
        return utils.lexicalAbsoluteToTransformReady(serializedLexical, this.getSiteUrl(), mergedOptions);
    }

    plaintextToTransformReady(plaintext: string, options: PlaintextToTransformReadyOptions = {}): string {
        const defaultOptions: PlaintextToTransformReadyOptions = {
            staticImageUrlPrefix: this._config.staticImageUrlPrefix
        };
        const mergedOptions = sanitizedMerge(defaultOptions, options);
        return utils.plaintextToTransformReady(plaintext, this.getSiteUrl(), mergedOptions);
    }

    isSiteUrl(url: URL, context: string = 'home'): boolean {
        const siteUrl = new URL(this.urlFor(context, true));
        if (siteUrl.host === url.host) {
            return url.pathname.startsWith(siteUrl.pathname);
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

    get STATIC_IMAGE_URL_PREFIX(): string {
        return this._config.staticImageUrlPrefix;
    }

    get _utils() {
        return utils;
    }
}

export type {UrlUtilsOptions, UrlUtilsConfig};
