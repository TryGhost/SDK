import * as socialUrls from './utils/socialUrls';

// # Twitter URL Helper
// Usage: `{{twitter_url}}` or `{{twitter_url author.twitter}}`
//
// Output a url for a twitter username

/**
 * Twitter URL Helper
 *
 * @param {object} data - the data we are filtering
 * @param {object} options - filter options
 */
export default function twitterUrl(username, options = {}) {
    if (!options) {
        options = username;
        // username = localUtils.findKey('twitter', this, options.data.blog);
    }

    if (username) {
        return socialUrls.twitter(username);
    }

    return null;
}
