import { ReferrerParser } from './lib/ReferrerParser';
import type { ReferrerData, ParserOptions } from './lib/ReferrerParser';

/**
 * Parse a referrer URL to get source, medium and hostname
 * 
 * @param referrerUrl - URL of the referrer to parse
 * @param options - Configuration options
 * @param referrerSource - Optional source to override URL parameters
 * @param referrerMedium - Optional medium to override URL parameters
 * @returns Parsed referrer data with source, medium and URL
 * 
 * @example
 * // Basic usage
 * const result = parse('https://www.google.com/search?q=ghost+cms');
 * // result: { referrerSource: 'Google', referrerMedium: 'search', referrerUrl: 'www.google.com' }
 * 
 * @example
 * // With site configuration
 * const result = parse('https://example.com/blog?utm_source=newsletter', {
 *   siteUrl: 'https://example.com'
 * });
 * 
 * @example
 * // With explicit source and medium
 * const result = parse('https://example.com', {}, 'newsletter', 'email');
 */
function parse(
    referrerUrl: string, 
    options: ParserOptions = {}, 
    referrerSource?: string, 
    referrerMedium?: string
): ReferrerData {
    const parser = new ReferrerParser(options);
    return parser.parse(referrerUrl, referrerSource, referrerMedium);
}

export {
    parse,
    ReferrerParser
};

export type {
    ReferrerData,
    ParserOptions
}; 