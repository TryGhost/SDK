const jwt = require('jsonwebtoken');

module.exports = function token(version, key) {
    const [id, secret] = key.split(':');

    return jwt.sign({}, Buffer.from(secret, 'hex'), { // eslint-disable-line no-undef
        keyid: id,
        algorithm: 'HS256',
        expiresIn: '5m',
        audience: `/${version}/admin/`
    });
};
