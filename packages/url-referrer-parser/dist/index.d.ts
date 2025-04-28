import { ReferrerParser, ReferrerData, ParserOptions } from './lib/ReferrerParser';

/**
 * Parse a referrer URL to get source, medium and hostname
 *
 * @param referrerUrl - URL of the referrer to parse
 * @param options - Configuration options
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
 */
declare function parse(referrerUrl: string, options?: ParserOptions): ReferrerData;
export { parse, ReferrerParser };
export type { ReferrerData, ParserOptions };
