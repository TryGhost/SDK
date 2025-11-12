import moment from 'moment-timezone';

interface PermalinkResource {
    published_at?: string | number | Date;
    primary_author?: {
        slug: string;
    };
    primary_tag?: {
        slug: string;
    };
    slug: string;
    id: string | number;
}

/**
 * creates the url path for a post based on blog timezone and permalink pattern
 */
function replacePermalink(permalink: string, resource: PermalinkResource, timezone: string = 'UTC'): string {
    const output = permalink;
    const primaryTagFallback = 'all';
    const publishedAtMoment = moment.tz(resource.published_at || Date.now(), timezone);
    const permalinkLookUp: Record<string, () => string> = {
        year: function () {
            return publishedAtMoment.format('YYYY');
        },
        month: function () {
            return publishedAtMoment.format('MM');
        },
        day: function () {
            return publishedAtMoment.format('DD');
        },
        author: function () {
            return resource.primary_author!.slug;
        },
        primary_author: function () {
            return resource.primary_author ? resource.primary_author.slug : primaryTagFallback;
        },
        primary_tag: function () {
            return resource.primary_tag ? resource.primary_tag.slug : primaryTagFallback;
        },
        slug: function () {
            return resource.slug;
        },
        id: function () {
            return String(resource.id);
        }
    };

    // replace tags like :slug or :year with actual values
    const permalinkKeys = Object.keys(permalinkLookUp);
    return output.replace(/(:[a-z_]+)/g, function (match: string): string {
        const key = match.substr(1);
        if (permalinkKeys.includes(key)) {
            return permalinkLookUp[key]();
        }
        return match;
    });
}

export default replacePermalink;
