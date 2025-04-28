/**
 * Interface for parsed referrer data
 */
export interface ReferrerData {
    /** The identified source of the referral traffic */
    referrerSource: string | null;
    /** The identified medium of the referral traffic */
    referrerMedium: string | null;
    /** The hostname of the referral URL */
    referrerUrl: string | null;
}

/**
 * Configuration options for the parser
 */
export interface ParserOptions {
    /** URL of the site for identifying internal traffic */
    siteUrl?: string;
    /** URL of the admin panel for identifying admin traffic */
    adminUrl?: string;
}

/**
 * Interface for referrer source data
 */
interface ReferrerSourceData {
    source: string;
    medium: string;
}

// Import known referrers data
import knownReferrers from './referrers.json';

/**
 * Parses referrer URLs to determine source and medium
 */
export class ReferrerParser {
    private adminUrl: URL | null;
    private siteUrl: URL | null;

    /**
     * Creates a new referrer parser instance
     * 
     * @param options - Configuration options
     */
    constructor(options: ParserOptions = {}) {
        this.adminUrl = this.getUrlFromStr(options.adminUrl || '');
        this.siteUrl = this.getUrlFromStr(options.siteUrl || '');
    }

    /**
     * Parse a referrer URL to get source, medium and hostname
     * 
     * @param referrerUrlStr - URL of the referrer
     * @param referrerSource - Source of the referrer
     * @param referrerMedium - Medium of the referrer
     * @returns Parsed referrer data with source, medium and URL
     */
    parse(referrerUrlStr: string, referrerSource?: string, referrerMedium?: string): ReferrerData {
        const referrerUrl = this.getUrlFromStr(referrerUrlStr);

        // Ghost-specific cases
        if (this.isGhostExploreRef({referrerUrl, referrerSource})) {
            return {
                referrerSource: 'Ghost Explore',
                referrerMedium: 'Ghost Network',
                referrerUrl: referrerUrl?.hostname ?? null
            };
        }

        // If referrer is Ghost.org
        if (this.isGhostOrgUrl(referrerUrl)) {
            return {
                referrerSource: 'Ghost.org',
                referrerMedium: 'Ghost Network',
                referrerUrl: referrerUrl?.hostname ?? null
            };
        }

        // Check for Ghost Newsletter
        if (referrerSource && this.isGhostNewsletter({referrerSource})) {
            return {
                referrerSource: referrerSource.replace(/-/g, ' '),
                referrerMedium: 'Email',
                referrerUrl: referrerUrl?.hostname ?? null
            };
        }

        // If referrer source is available from parameters
        if (referrerSource) {
            const urlData = this.getDataFromUrl(referrerUrl);
            const knownSource = Object.values(knownReferrers as Record<string, ReferrerSourceData>).find(referrer => 
                referrer.source.toLowerCase() === referrerSource.toLowerCase());
            
            return {
                referrerSource: knownSource?.source || referrerSource,
                referrerMedium: knownSource?.medium || referrerMedium || urlData?.medium || null,
                referrerUrl: referrerUrl?.hostname ?? null
            };
        }

        // If referrer is known external URL
        if (!this.isSiteDomain(referrerUrl)) {
            const urlData = this.getDataFromUrl(referrerUrl);

            // Use known source/medium if available
            if (urlData) {
                return {
                    referrerSource: urlData?.source ?? null,
                    referrerMedium: urlData?.medium ?? null,
                    referrerUrl: referrerUrl?.hostname ?? null
                };
            }
            
            // Use the hostname as a source
            return {
                referrerSource: referrerUrl?.hostname ?? null,
                referrerMedium: null,
                referrerUrl: referrerUrl?.hostname ?? null
            };
        }

        return {
            referrerSource: null,
            referrerMedium: null,
            referrerUrl: null
        }
    }

    /**
     * Fetches referrer data from known external URLs
     * 
     * @param url - The URL to match against known referrers
     * @returns Matched referrer data or null if not found
     */
    getDataFromUrl(url: URL | null): ReferrerSourceData | null {
        // Handle null url case
        if (!url) {
            return null;
        }

        // Allow matching both "google.ac/products" and "google.ac" as a source
        const urlHostPath = url.hostname + url.pathname;
        const urlDataKey = Object.keys(knownReferrers as Record<string, ReferrerSourceData>).sort((a, b) => {
            // The longer key has higher priority so google.ac/products is selected before google.ac
            return b.length - a.length;
        }).find((source) => {
            return urlHostPath.startsWith(source);
        });

        return urlDataKey ? (knownReferrers as Record<string, ReferrerSourceData>)[urlDataKey] : null;
    }

    /**
     * Return URL object for provided URL string
     * 
     * @param url - URL string to parse
     * @returns Parsed URL object or null if invalid
     */
    getUrlFromStr(url: string): URL | null {
        if (!url) {
            return null;
        }
        
        try {
            return new URL(url);
        } catch (e) {
            return null;
        }
    }

    /**
     * Determine whether the provided URL is a link to the site
     * 
     * @param url - URL to check
     * @returns True if the URL belongs to the configured site
     */
    isSiteDomain(url: URL | null): boolean {
        try {
            // If we don't have siteUrl configured, we can't detect internal traffic
            if (!this.siteUrl) {
                return false;
            }

            if (!url) {
                return false;
            }

            if (this.siteUrl.hostname === url.hostname) {
                if (url.pathname.startsWith(this.siteUrl.pathname)) {
                    return true;
                }
                return false;
            }
            return false;
        } catch (e) {
            return false;
        }
    }

    /**
     * Determine whether referrer is a Ghost newsletter
     * 
     * @param deps - Input parameters
     * @returns True if the referrer is a Ghost newsletter
     */
    isGhostNewsletter({referrerSource}: {referrerSource: string | null}): boolean {
        if (!referrerSource) {
            return false;
        }
        // if referrer source ends with -newsletter
        return referrerSource.endsWith('-newsletter');
    }

    /**
     * Determine whether referrer is a Ghost.org URL
     * 
     * @param referrerUrl - The referrer URL to check
     * @returns True if the referrer is from Ghost.org
     */
    isGhostOrgUrl(referrerUrl: URL | null): boolean {
        if (!referrerUrl) {
            return false;
        }
        return referrerUrl.hostname === 'ghost.org';
    }

    /**
     * Determine whether referrer is Ghost Explore
     * 
     * @param deps - Input parameters
     * @returns True if the referrer is from Ghost Explore
     */
    isGhostExploreRef({referrerUrl, referrerSource}: {referrerUrl: URL | null, referrerSource?: string | null}): boolean {
        if (referrerSource === 'ghost-explore') {
            return true;
        }

        if (!referrerUrl) {
            return false;
        }

        if (referrerUrl?.hostname
            && this.adminUrl?.hostname === referrerUrl?.hostname
            && referrerUrl?.pathname?.startsWith(this.adminUrl?.pathname)
        ) {
            return true;
        }

        if (referrerUrl.hostname === 'ghost.org' && referrerUrl.pathname.startsWith('/explore')) {
            return true;
        }

        return false;
    }
} 