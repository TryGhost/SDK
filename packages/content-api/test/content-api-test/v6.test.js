const should = require('should');
const sinon = require('sinon');

const GhostContentApi = require('../../cjs/content-api');
const packageJSON = require('../../package.json');
const packageVersion = packageJSON.version;

describe('GhostContentApi v6', function () {
    it('Uses non-versioned URL and correct Accept-Version header for v6.0', async function () {
        const makeRequestStub = sinon.stub().returns(Promise.resolve({
            data: {
                settings: {}
            }
        }));

        const api = new GhostContentApi({
            version: 'v6.0',
            url: 'http://ghost.local',
            key: '0123456789abcdef0123456789',
            makeRequest: makeRequestStub
        });

        await api.settings.browse();

        makeRequestStub.calledOnce.should.be.true();
        should.equal(makeRequestStub.args[0][0].url, 'http://ghost.local/ghost/api/content/settings/');
        should.equal(makeRequestStub.args[0][0].headers['Accept-Version'], 'v6.0');
        should.equal(makeRequestStub.args[0][0].headers['User-Agent'], `GhostContentSDK/${packageVersion}`);
    });
});
