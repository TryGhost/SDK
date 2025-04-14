/**
 * @param {string} username
 * @returns {string}
 */
module.exports.twitter = function twitter(username) {
    // Creates the canonical twitter URL without the '@'
    return 'https://twitter.com/' + username.replace(/^@/, '');
};

/**
 * @param {string} username
 * @returns {string}
 */
module.exports.facebook = function facebook(username) {
    // Handles a starting slash, this shouldn't happen, but just in case
    return 'https://www.facebook.com/' + username.replace(/^\//, '');
};

/**
 * @param {string} username
 * @returns {string}
 */
module.exports.threads = function threads(username) {
    // a threads profile url is always prefixed with @
    username = username.replace(/^@/, '');
    return 'https://www.threads.net/@' + username;
};