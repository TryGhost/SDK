const jwt = require('jsonwebtoken');

/**
 *
 * @param {String} key - API key to sign JWT with
 * @param {String} audience - token audience
 * @returns
 */
module.exports = function token(key, audience) {
    const [id, secret] = key.split(':');

    return jwt.sign({}, Buffer.from(secret, 'hex'), { // eslint-disable-line no-undef
        keyid: id,
        algorithm: 'HS256',
        expiresIn: '5m',
        audience
    });
};
