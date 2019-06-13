const url = require('url');

function isSSL(urlToParse) {
    var protocol = url.parse(urlToParse).protocol;
    return protocol === 'https:';
}

module.exports = isSSL;
