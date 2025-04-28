/**
 * Interface for referrer source data
 */
interface ReferrerSourceData {
    source: string;
    medium: string;
}

/**
 * Known referrers mapping
 */
declare const referrers: Record<string, ReferrerSourceData>;

export default referrers; 