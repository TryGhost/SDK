const jwt = require('jsonwebtoken');

const getToken = (apiEndpoint, applicationKey) => {
    const [id, secret] = applicationKey.split(':');
    return jwt.sign({}, Buffer.from(secret, 'hex'), {
        algorithm: 'HS256',
        expiresIn: '5m',
        audience: apiEndpoint,
        issuer: id,
        keyid: id
    });
};

module.exports = getToken;
