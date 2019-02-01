import jwt from 'jsonwebtoken';

const token = (endpoint, key) => {
    const [id, secret] = key.split(':');

    return jwt.sign({
        kid: id
    }, Buffer.from(secret, 'hex'), { // eslint-disable-line no-undef
        algorithm: 'HS256',
        expiresIn: '5m',
        audience: endpoint
    });
};

export default token;
