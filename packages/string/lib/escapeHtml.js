/**
 * escapeHTML
 * 
 * Escape a string to be used as text or an attribute in HTML
 * 
 * @param {string} string - the string we want to escape
 * @returns {string} The escaped string
 */
module.exports = function (string) {
    const htmlChars = {
        '&': '&amp;',
        '"': '&quot;',
        '\'': '&apos;',
        '<': '&lt;',
        '>': '&gt;'
    };
    return string.replace(/[&"'<>]/g, c => htmlChars[c]);
};
