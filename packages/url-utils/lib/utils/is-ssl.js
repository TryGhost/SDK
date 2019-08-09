function isSSL(urlToParse) {
    const {protocol} = new URL(urlToParse);
    return protocol === 'https:';
}

module.exports = isSSL;
