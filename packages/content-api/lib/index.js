import axios from 'axios';

export default function GhostContentAPI({host, version, key}) {
    if (this instanceof GhostContentAPI) {
        return GhostContentAPI({host, version, key});
    }
    const api = ['posts', 'authors', 'tags', 'pages', 'settings'].reduce((apiObject, resourceType) => {
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

    delete api.settings.read;

    return api;

    function makeRequest(resourceType, userParams, id, membersToken = null) {
        delete userParams.id;

        const headers = membersToken ? {
            Authorization: `GhostMembers ${membersToken}`
        } : undefined;

        const params = Object.keys(userParams).reduce((params, key) => {
            const val = [].concat(userParams[key]).join(',');
            return Object.assign(params, {
                [key]: val
            });
        }, {});

        return axios.get(`${host}/api/${version}/content/${resourceType}/${id ? id + '/' : ''}`, {
            params: Object.assign({key}, params),
            headers
        }).then((res) => {
            if (!Array.isArray(res.data[resourceType])) {
                return res.data[resourceType];
            }
            if (res.data[resourceType].length === 1 && !res.data.meta) {
                return res.data[resourceType][0];
            }
            return Object.assign(res.data[resourceType], {meta: res.data.meta});
        });
    }
}
