/**
 * @param {string} username
 * @returns {string}
 */
module.exports.twitter = function twitter(username) {
    // Creates the canonical twitter URL without the '@'
    return 'https://x.com/' + username.replace(/^@/, '');
};

// Alias for twitter to support X
module.exports.x = module.exports.twitter;

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

/**
 * @param {string} username
 * @returns {string}
 */
module.exports.bluesky = function bluesky(username) {
    // Bluesky URLs use profile path, no @ in stored handle
    return 'https://bsky.app/profile/' + username;
};

/**
 * @param {string} username
 * @returns {string}
 */
module.exports.mastodon = function mastodon(username) {
    // Mastodon stores full URL without https://, just prepend protocol
    return 'https://' + username;
};

/**
 * @param {string} username
 * @returns {string}
 */
module.exports.tiktok = function tiktok(username) {
    // TikTok URLs include @, handles stored with or without @
    username = username.startsWith('@') ? username : '@' + username;
    return 'https://www.tiktok.com/' + username;
};

/**
 * @param {string} username
 * @returns {string}
 */
module.exports.youtube = function youtube(username) {
    // YouTube handles include @, user/, or channel/, stored as-is
    return 'https://www.youtube.com/' + username;
};

/**
 * @param {string} username
 * @returns {string}
 */
module.exports.instagram = function instagram(username) {
    // Instagram URLs have no @, stored without @
    return 'https://www.instagram.com/' + username;
};

/**
 * @param {string} username
 * @returns {string}
 */
module.exports.linkedin = function linkedin(username) {
    // LinkedIn URLs use in/, company/, school/, or pub/ stored as-is
    const pathTypes = ['in/', 'company/', 'school/', 'pub/'];
    // If username doesn't start with one of those, default to in/
    const endOfUrl = pathTypes.some(pathType => username.startsWith(pathType)) ? username : 'in/' + username;

    return 'https://www.linkedin.com/' + endOfUrl;
};