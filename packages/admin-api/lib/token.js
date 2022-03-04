const jwt = require('jsonwebtoken');

/**
 *
 * @param {String} key - API key to sign JWT with
 * @param {String} version - API version to use as a part of audience
 * @returns
 */
module.exports = function token(key, version) {
    const [id, secret] = key.split(':');
    const audience = version ? `/${version}/admin/` : '/admin/';

    return jwt.sign({}, Buffer.from(secret, 'hex'), { // eslint-disable-line no-undef
        keyid: id,
        algorithm: 'HS256',
        expiresIn: '5m',
        audience
    });
};
