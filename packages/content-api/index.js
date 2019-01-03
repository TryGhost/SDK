const axios = require('axios');

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

        const headers = membersToken ? {
            Authorization: `GhostMembers ${membersToken}`
        } : undefined;

        return axios.get(`${host}/api/${version}/content/${resourceType}/${id ? id + '/' : ''}`, {
            params: Object.assign({key}, params),
            headers
        }).then((res) => {
            if (res.data[resourceType].length === 1 && !res.data.meta) {
                return res.data[resourceType][0];
            }
            return Object.assign(res.data[resourceType], {meta: res.data.meta});
        });
    }
};

module.exports.create = create;
