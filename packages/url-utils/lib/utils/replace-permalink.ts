import moment from 'moment-timezone';

interface Resource {
    published_at?: string | Date;
    slug: string;
    id: string | number;
    primary_author?: {
        slug: string;
    };
    primary_tag?: {
        slug: string;
    };
}

/**
 * creates the url path for a post based on blog timezone and permalink pattern
 */
function replacePermalink(permalink: string, resource: Resource, timezone = 'UTC'): string {
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
    return output.replace(/(:[a-z_]+)/g, function (match) {
        if (permalinkKeys.includes(match.substr(1))) {
            return permalinkLookUp[match.substr(1)]();
        }
        return match;
    });
}

export default replacePermalink;
