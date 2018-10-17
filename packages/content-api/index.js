const pick = require('lodash/pick');
const request = require('superagent');
const resources = require('./api');

const create = ({host, version, key}) => {
    return Object.keys(resources).reduce((apiObject, resourceType) => {
        function browse(options = {}) {
            const resourceOptions = resources[resourceType].browse.options;

            const params = pick(options, resourceOptions);
            return makeRequest(resourceType, params);
        }
        function read(data, options = {}) {
            if (!data || !data.id) {
                return Promise.reject(new Error('Missing data.id'));
            }

            const resourceOptions = resources[resourceType].read.options;
            const resourceData = resources[resourceType].read.data;

            const params = Object.assign(
                pick(options, resourceOptions),
                pick(data, resourceData)
            );

            return makeRequest(resourceType, params, data.id);
        }

        return Object.assign(apiObject, {
            [resourceType]: {
                read,
                browse
            }
        });
    }, {});

    function makeRequest(resourceType, params, id) {
        delete params.id;
        return request.get(`${host}/api/${version}/content/${resourceType}/${id ? id + '/' : ''}`)
            .query(Object.assign({key}, params))
            .then((res) => {
                if (res.body[resourceType].length === 1 && !res.body.meta) {
                    return res.body[resourceType][0];
                }
                return Object.assign(res.body[resourceType], {meta: res.body.meta});
            });
    }
};

module.exports.create = create;
