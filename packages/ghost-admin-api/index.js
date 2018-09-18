const got = require('got');
const getToken = require('./lib/getToken');

const createGhostAdminAPI = function createGhostAdminAPI({apiHost, applicationKey}) {
    return got.create({
        options: got.mergeOptions(got.defaults.options, {
            json: true,
            baseUrl: apiHost,
            applicationKey
        }),
        methods: got.defaults.methods,
        handler: (options, next) => {
            options.headers.authorization = `Bearer ${getToken(options.path, applicationKey)}`;
            return next(options);
        }
    });
};

module.exports.create = createGhostAdminAPI;
