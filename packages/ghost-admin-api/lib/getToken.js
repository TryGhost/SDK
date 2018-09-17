const jwt = require('jsonwebtoken');

const getToken = function getToken(apiHost, applicationKey) {
    const [id, secret] = applicationKey.split(':');
    return jwt.sign({}, Buffer.from(secret, 'hex'), {
        algorithm: 'HS256',
        expiresIn: '5m',
        audience: apiHost,
        issuer: id,
        keyid: id
    });
};

module.exports = getToken;
