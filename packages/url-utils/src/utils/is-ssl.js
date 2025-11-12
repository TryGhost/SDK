// require the whatwg compatible URL library (same behaviour in node and browser)
const {URL} = require('url');

function isSSL(urlToParse) {
    const {protocol} = new URL(urlToParse);
    return protocol === 'https:';
}

module.exports = isSSL;
