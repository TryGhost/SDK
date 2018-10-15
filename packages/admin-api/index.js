const {URL} = require('url');
const fetch = require('node-fetch');
fetch.Promise = require('bluebird');

const getToken = require('./lib/getToken');

const createGhostAdminApi = ({apiHost, applicationKey}) => (input, init) => {
    const url = new URL(input, apiHost);
    const request = new fetch.Request(url, init);
    request.headers.set('Authorization', `Ghost: ${getToken(url.pathname, applicationKey)}`);
    request.headers.set('Content-Type', 'application/json');
    request.headers.set('Accept', 'application/json');
    return fetch(request);
};

module.exports.create = createGhostAdminApi;
