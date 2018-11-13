const request = require('superagent');

const create = ({host, version, key}) => {
    return ['posts', 'authors', 'tags', 'pages'].reduce((apiObject, resourceType) => {
        function browse(options = {}, memberToken) {
            return makeRequest(resourceType, options, null, memberToken);
        }
        function read(data, options = {}, memberToken) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            if (!data.id && !data.slug) {
                return Promise.reject(new Error('Must include either data.id or data.slug'));
            }

            const params = Object.assign({}, data, options);

            return makeRequest(resourceType, params, data.id || `slug/${data.slug}`, memberToken);
        }

        return Object.assign(apiObject, {
            [resourceType]: {
                read,
                browse
            }
        });
    }, {});

    function makeRequest(resourceType, params, id, membersToken = null) {
        delete params.id;
        const parseResponse = (res) => {
            if (res.body[resourceType].length === 1 && !res.body.meta) {
                return res.body[resourceType][0];
            }
            return Object.assign(res.body[resourceType], {meta: res.body.meta});
        };

        const req = request.get(`${host}/api/${version}/content/${resourceType}/${id ? id + '/' : ''}`)
            .query(Object.assign({key}, params));

        if (membersToken) {
            return req.set('Authorization', `GhostMembers ${membersToken}`)
                .then(parseResponse);
        }
        return req.then(parseResponse);
    }
};

module.exports.create = create;
