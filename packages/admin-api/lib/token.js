import jwt from 'jsonwebtoken';

const token = (version, key) => {
    const [id, secret] = key.split(':');

    return jwt.sign({
        kid: id
    }, Buffer.from(secret, 'hex'), { // eslint-disable-line no-undef
        algorithm: 'HS256',
        expiresIn: '5m',
        audience: `/${version}/admin/`
    });
};

export default token;
