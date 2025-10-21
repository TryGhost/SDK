import moment from 'moment-timezone';

interface PermalinkResource {
    published_at?: string | number | Date | null;
    slug: string;
    id: string;
    primary_author?: {slug: string} | null;
    primary_tag?: {slug: string} | null;
}

/**
 * creates the url path for a post based on blog timezone and permalink pattern
 */
function replacePermalink(permalink: string, resource: PermalinkResource, timezone: string = 'UTC'): string {
    const primaryTagFallback = 'all';
    const publishedAtMoment = moment.tz(resource.published_at || Date.now(), timezone);
    const permalinkLookUp: Record<string, () => string> = {
        year() {
            return publishedAtMoment.format('YYYY');
        },
        month() {
            return publishedAtMoment.format('MM');
        },
        day() {
            return publishedAtMoment.format('DD');
        },
        author() {
            return resource.primary_author?.slug ?? primaryTagFallback;
        },
        primary_author() {
            return resource.primary_author?.slug ?? primaryTagFallback;
        },
        primary_tag() {
            return resource.primary_tag?.slug ?? primaryTagFallback;
        },
        slug() {
            return resource.slug;
        },
        id() {
            return resource.id;
        }
    };

    // replace tags like :slug or :year with actual values
    const permalinkKeys = Object.keys(permalinkLookUp);
    return permalink.replace(/(:[a-z_]+)/g, function (match) {
        const key = match.slice(1);
        if (permalinkKeys.includes(key)) {
            return permalinkLookUp[key]();
        }
        return 'undefined';
    });
}

export default replacePermalink;
