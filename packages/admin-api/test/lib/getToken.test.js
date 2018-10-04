const assert = require('assert');
const jwt = require('jsonwebtoken');

const getToken = require('../../lib/getToken');
const apiHost = 'https://domain.tld';
const applicationId = 'mmm';
const applicationSecret = 'bad455';
const applicationKey = `${applicationId}:${applicationSecret}`;

describe('lib/getToken', () => {
    it('exports a function', () => {
        assert.equal(typeof getToken, 'function');
    });
    it('returns a JWT when called with apiHost and appicationKey', () => {
        try {
            jwt.decode(getToken(apiHost, applicationKey));
        } catch (err) {
            assert.fail(err);
        }
    });
    describe('returned JWT', () => {
        it('has an alg header of HS256', () => {
            const token = getToken(apiHost, applicationKey);
            const {header} = jwt.decode(token, {complete: true});
            assert.equal(header.alg, 'HS256');
        });
        it('has a kid header of applicationKey id', () => {
            const token = getToken(apiHost, applicationKey);
            const {header} = jwt.decode(token, {complete: true});
            assert.equal(header.kid, applicationId);
        });
        it('has an aud claim of apiHost', () => {
            const token = getToken(apiHost, applicationKey);
            const claims = jwt.decode(token);
            assert.equal(claims.aud, apiHost);
        });
        it('has an iss claim of applicationKey id', () => {
            const token = getToken(apiHost, applicationKey);
            const claims = jwt.decode(token);
            assert.equal(claims.iss, applicationId);
        });
        it('is signed using applicationKey secret with HS256 alg', () => {
            const token = getToken(apiHost, applicationKey);
            try {
                jwt.verify(token, Buffer.from(applicationSecret, 'hex'), {
                    algorithms: ['HS256']
                });
            } catch (err) {
                assert.fail(err);
            }
        });
    });
});
