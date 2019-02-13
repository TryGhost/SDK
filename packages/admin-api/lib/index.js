import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
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
        function add(data, options = {}) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            const mapped = {};

            if (resourceType === 'posts') {
                // TODO: these data manipulations and validations are resource specific
                // should extract them into separate data mappings methods per resource type
                if (!data.author && !data.authors) {
                    return Promise.reject(new Error('Missing author data. Expected `author` id or `authors` ids array'));
                }

                let authors = [];
                if (data.author) {
                    authors.push({id: data.author});
                    delete data.author;
                } else {
                    authors = data.authors.map(id => ({id}));
                    delete data.authors;
                }

                data.authors = authors;

                // resource data should not contain id or slug information
                delete data.id;
                delete data.slug;

                mapped[resourceType] = [data];
            }

            return makeResourceRequest(resourceType, options, mapped, 'POST');
        }
        function edit(data, options = {}) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            if (!data.id && !data.slug) {
                return Promise.reject(new Error('Must include either data.id or data.slug'));
            }

            const mapped = {};

            if (data.id) {
                mapped.id = data.id;
                delete data.id;
            }

            if (data.slug) {
                mapped.slug = data.slug;
            }

            mapped[resourceType] = [data];

            return makeResourceRequest(resourceType, options, mapped, 'PUT');
        }
        function destroy(data, options = {}) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            if (!data.id) {
                return Promise.reject(new Error('Must include either data.id'));
            }

            return makeResourceRequest(resourceType, options, data, 'DELETE');
        }
        function browse(options = {}) {
            return makeResourceRequest(resourceType, options);
        }
        function read(data, options = {}) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            if (!data.id && !data.slug) {
                return Promise.reject(new Error('Must include either data.id or data.slug'));
            }

            const params = Object.assign({}, data, options);

            return makeResourceRequest(resourceType, params, data);
        }

        return Object.assign(apiObject, {
            [resourceType]: {
                read,
                browse,
                add,
                edit,
                destroy
            }
        });
    }, {});

    api.images = {
        add(data) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            if (typeof data !== FormData && !data.path) {
                return Promise.reject(new Error('Must be of FormData or include path'));
            }

            let formData;
            if (data.path) {
                formData = new FormData();
                formData.append('uploadimage', fs.createReadStream(data.path));
            }

            return makeImageRequest(formData || data);
        }
    };

    api.configuration = {
        read() {
            return makeResourceRequest('configuration', {}, {});
        },

        about: {
            read() {
                return makeResourceRequest('configuration/about', {}, {});
            }
        }
    };

    return api;

    function makeImageRequest(data) {
        const headers = {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`
        };

        return makeApiRequest({
            endpoint: endpointFor('images'),
            method: 'POST',
            data,
            headers
        });
    }

    function makeResourceRequest(resourceType, params, data = {}, method = 'GET') {
        delete params.id;

        return makeApiRequest({
            endpoint: endpointFor(resourceType, data),
            method,
            params,
            data
        }).then((data) => {
            if (method === 'DELETE') {
                return data;
            }

            // HACK: the configuration/about endpoint doesn't match the typical
            // resource url structure and return value so we need to special-case it
            if (resourceType === 'configuration/about') {
                resourceType = 'configuration';
            }

            if (!Array.isArray(data[resourceType])) {
                return data[resourceType];
            }
            if (data[resourceType].length === 1 && !data.meta) {
                return data[resourceType][0];
            }
            return Object.assign(data[resourceType], {meta: data.meta});
        });
    }

    function endpointFor(resource, {id, slug} = {}) {
        let endpoint = `/${ghostPath}/api/${version}/admin/${resource}/`;

        if (id) {
            endpoint = `${endpoint}${id}/`;
        } else if (slug) {
            endpoint = `${endpoint}slug/${slug}/`;
        }

        return endpoint;
    }

    function makeApiRequest({endpoint, method, data, params = {}, headers = {}}) {
        const url = `${host}${endpoint}`;

        headers = Object.assign({}, headers, {
            Authorization: `Ghost ${token(endpoint, key)}`
        });

        return makeRequest({
            url,
            method,
            data,
            params,
            headers
        });
    }

    function makeRequest({url, method, data, params = {}, headers = {}}) {
        return axios({
            url,
            method,
            params,
            data,
            headers,
            paramsSerializer(params) {
                return Object.keys(params).reduce((parts, key) => {
                    const val = encodeURIComponent([].concat(params[key]).join(','));
                    return parts.concat(`${key}=${val}`);
                }, []).join('&');
            }
        }).then((res) => {
            return res.data;
        });
    }
}
