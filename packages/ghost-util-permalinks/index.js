const defaultPrimaryTagFallback = 'all';

// Assumes that dates are already in the correct timezone
module.exports = (permalink, resource, options) => {
    options = options || {};

    let primaryTagFallback = options.primaryTagFallback || defaultPrimaryTagFallback;

    let output = permalink,
        permalinkLookUp = {
            slug() {
                return resource.slug;
            },
            id() {
                return resource.id;
            }
        };

    if (resource.published_at) {
        permalinkLookUp.year = () => new Date(resource.published_at).getFullYear();
        permalinkLookUp.month = () => new Date(resource.published_at).getMonth();
        permalinkLookUp.day = () => new Date(resource.published_at).getDay();
    }

    if (resource.primary_author) {
        permalinkLookUp.author = () => resource.primary_author.slug;
        permalinkLookUp.primary_author = () => {
            return resource.primary_author ? resource.primary_author.slug : primaryTagFallback;
        };
    }

    if (resource.primary_tag) {
        permalinkLookUp.primary_tag = () => {
            return resource.primary_tag ? resource.primary_tag.slug : primaryTagFallback;
        };
    }

    // replace tags like :slug or :year with actual values
    output = output.replace(/(:[a-z_]+)/g, function (match) {
        if (permalinkLookUp.hasOwnProperty(match.substr(1))) {
            return permalinkLookUp[match.substr(1)]();
        }
    });

    return output;
};
