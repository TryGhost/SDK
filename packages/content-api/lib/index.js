import axios from 'axios';

const supportedVersions = ['v2'];

export default function GhostContentAPI({host, ghostPath = 'ghost', version, key}) {
    if (this instanceof GhostContentAPI) {
        return GhostContentAPI({host, version, key});
    }
    if (!version) {
        throw new Error('GhostContentAPI Config Missing: @tryghost/content-api requires a "version" like "v2"');
    }
    if (!supportedVersions.includes(version)) {
        throw new Error('GhostContentAPI Config Invalid: @tryghost/content-api does not support the supplied version');
    }
    if (!host) {
        throw new Error('GhostContentAPI Config Missing: @tryghost/content-api requires a "host" like "https://site.com"');
    }
    if (!/https?:\/\//.test(host)) {
        throw new Error('GhostContentAPI Config Invalid: @tryghost/content-api requires a "host" with a protocol like "https://site.com"');
    }
    if (host.endsWith('/')) {
        throw new Error('GhostContentAPI Config Invalid: @tryghost/content-api requires a "host" without a trailing slash like "https://site.com"');
    }
    if (ghostPath.endsWith('/') || ghostPath.startsWith('/')) {
        throw new Error('GhostContentAPI Config Invalid: @tryghost/content-api requires a "ghostPath" without a leading or trailing slash like "ghost"');
    }
    if (key && !/[0-9a-f]{26}/.test(key)) {
        throw new Error('GhostContentAPI Config Invalid: @tryghost/content-api requires a "key" with 26 hex characters');
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
        if (!membersToken && !key) {
            return Promise.reject(
                new Error('GhostContentAPI Config Missing: @tryghost/content-api was instantiated without a content key')
            );
        }
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

        return axios.get(`${host}/${ghostPath}/api/${version}/content/${resourceType}/${id ? id + '/' : ''}`, {
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
