// Verbatim copy of the @tryghost/url-utils@5.3.0 implementation, used to check
// the optimised implementation produces identical output. Not shipped.
const moment = require('moment-timezone');

function replacePermalink(permalink, resource, timezone = 'UTC') {
    const primaryTagFallback = 'all';
    const publishedAtMoment = moment.tz(resource.published_at || Date.now(), timezone);
    const permalinkLookUp = {
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
            return resource.primary_author?.slug ?? 'undefined';
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
            return resource.id;
        }
    };

    // replace tags like :slug or :year with actual values
    const permalinkKeys = Object.keys(permalinkLookUp);
    return permalink.replace(/(:[a-z_]+)/g, function (match) {
        const key = match.slice(1);
        if (permalinkKeys.includes(key)) {
            // Known route segment - use the lookup function
            return permalinkLookUp[key]();
        }
        // Unknown route segment - return 'undefined' string
        return 'undefined';
    });
}

module.exports = {
    replacePermalink
};
