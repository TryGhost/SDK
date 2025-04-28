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
/**
 * Parses referrer URLs to determine source and medium
 */
export declare class ReferrerParser {
    private adminUrl;
    private siteUrl;
    /**
     * Creates a new referrer parser instance
     *
     * @param options - Configuration options
     */
    constructor(options?: ParserOptions);
    /**
     * Parse a referrer URL to get source, medium and hostname
     *
     * @param referrerUrlStr - URL of the referrer
     * @returns Parsed referrer data with source, medium and URL
     */
    parse(referrerUrlStr: string): ReferrerData;
    /**
     * Fetches referrer data from known external URLs
     *
     * @param url - The URL to match against known referrers
     * @returns Matched referrer data or null if not found
     */
    getDataFromUrl(url: URL | null): ReferrerSourceData | null;
    /**
     * Return URL object for provided URL string
     *
     * @param url - URL string to parse
     * @returns Parsed URL object or null if invalid
     */
    getUrlFromStr(url: string): URL | null;
    /**
     * Determine whether the provided URL is a link to the site
     *
     * @param url - URL to check
     * @returns True if the URL belongs to the configured site
     */
    isSiteDomain(url: URL | null): boolean;
    /**
     * Determine whether referrer is a Ghost newsletter
     *
     * @param deps - Input parameters
     * @returns True if the referrer is a Ghost newsletter
     */
    isGhostNewsletter({ referrerSource }: {
        referrerSource: string | null;
    }): boolean;
    /**
     * Determine whether referrer is a Ghost.org URL
     *
     * @param referrerUrl - The referrer URL to check
     * @returns True if the referrer is from Ghost.org
     */
    isGhostOrgUrl(referrerUrl: URL | null): boolean;
    /**
     * Determine whether referrer is Ghost Explore
     *
     * @param deps - Input parameters
     * @returns True if the referrer is from Ghost Explore
     */
    isGhostExploreRef({ referrerUrl, referrerSource }: {
        referrerUrl: URL | null;
        referrerSource?: string | null;
    }): boolean;
}
export {};
