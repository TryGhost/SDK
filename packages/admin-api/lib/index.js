import axios from 'axios';
import token from './token';

const supportedVersions = ['v2'];

export default function GhostAdminAPI({host, ghostPath = 'ghost', version, key}) {
    if (this instanceof GhostAdminAPI) {
        return GhostAdminAPI({host, version, key});
    }
    if (!version) {
        throw new Error('GhostAdminAPI Config Missing: @tryghost/admin-api requires a "version" like "v2"');
    }
    if (!supportedVersions.includes(version)) {
        throw new Error('GhostAdminAPI Config Invalid: @tryghost/admin-api does not support the supplied version');
    }
    if (!host) {
        throw new Error('GhostAdminAPI Config Missing: @tryghost/admin-api requires a "host" like "https://site.com"');
    }
    if (!/https?:\/\//.test(host)) {
        throw new Error('GhostAdminAPI Config Invalid: @tryghost/admin-api requires a "host" with a protocol like "https://site.com"');
    }
    if (host.endsWith('/')) {
        throw new Error('GhostAdminAPI Config Invalid: @tryghost/admin-api requires a "host" without a trailing slash like "https://site.com"');
    }
    if (ghostPath.endsWith('/') || ghostPath.startsWith('/')) {
        throw new Error('GhostAdminAPI Config Invalid: @tryghost/admin-api requires a "ghostPath" without a leading or trailing slash like "ghost"');
    }
    if (key && !/[0-9a-f]{24}:[0-9a-f]{64}/.test(key)) {
        throw new Error('GhostAdminAPI Config Invalid: @tryghost/admin-api requires a "key" in following format {A}:{B}, where A is 24 hex characters and B is 64 hex characters');
    }
    const api = ['posts'].reduce((apiObject, resourceType) => {
        function add() {
            throw 'not implemented';
        }
        function edit() {
            throw 'not implemented';
        }
        function browse(options = {}) {
            return makeRequest(resourceType, options, null);
        }
        function read(data, options = {}) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            if (!data.id && !data.slug) {
                return Promise.reject(new Error('Must include either data.id or data.slug'));
            }

            const params = Object.assign({}, data, options);

            return makeRequest(resourceType, params, data.id || `slug/${data.slug}`);
        }

        return Object.assign(apiObject, {
            [resourceType]: {
                read,
                browse,
                add,
                edit
            }
        });
    }, {});

    return api;

    function makeRequest(resourceType, params, id) {
        // delete params.id;
        const endpoint = `/${ghostPath}/api/${version}/admin/${resourceType}/${id ? id + '/' : ''}`;
        const url = `${host}${endpoint}`;

        const headers = {
            Authorization: `Ghost ${token(endpoint, key)}`
        };

        return axios.get(url, {
            params: params,
            paramsSerializer: (params) => {
                return Object.keys(params).reduce((parts, key) => {
                    const val = encodeURIComponent([].concat(params[key]).join(','));
                    return parts.concat(`${key}=${val}`);
                }, []).join('&');
            },
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
