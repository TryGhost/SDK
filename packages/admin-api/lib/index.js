const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const token = require('./token');

const supportedVersions = ['v2', 'v3', 'canary'];

module.exports = function GhostAdminAPI(options) {
    if (this instanceof GhostAdminAPI) {
        return GhostAdminAPI(options);
    }

    const defaultConfig = {
        ghostPath: 'ghost',
        makeRequest({url, method, data, params = {}, headers = {}}) {
            return axios({
                url,
                method,
                params,
                data,
                headers,
                maxContentLength: Infinity,
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
    };

    const config = Object.assign({}, defaultConfig, options);

    // new GhostAdminAPI({host: '...'}) is deprecated
    if (config.host) {
        // eslint-disable-next-line
        console.warn('GhostAdminAPI\'s `host` parameter is deprecated, please use `url` instead');
        if (!config.url) {
            config.url = config.host;
        }
    }

    if (!config.version) {
        throw new Error('GhostAdminAPI Config Missing: @tryghost/admin-api requires a "version" like "v2"');
    }
    if (!supportedVersions.includes(config.version)) {
        throw new Error('GhostAdminAPI Config Invalid: @tryghost/admin-api does not support the supplied version');
    }
    if (!config.url) {
        throw new Error('GhostAdminAPI Config Missing: @tryghost/admin-api requires a "url" like "https://site.com" or "https://site.com/blog"');
    }
    if (!/https?:\/\//.test(config.url)) {
        throw new Error('GhostAdminAPI Config Invalid: @tryghost/admin-api requires a "url" with a protocol like "https://site.com" or "https://site.com/blog"');
    }
    if (config.url.endsWith('/')) {
        throw new Error('GhostAdminAPI Config Invalid: @tryghost/admin-api requires a "url" without a trailing slash like "https://site.com" or "https://site.com/blog"');
    }
    if (config.ghostPath.endsWith('/') || config.ghostPath.startsWith('/')) {
        throw new Error('GhostAdminAPI Config Invalid: @tryghost/admin-api requires a "ghostPath" without a leading or trailing slash like "ghost"');
    }
    if (!config.key) {
        throw new Error('GhostAdminAPI Config Invalid: @tryghost/admin-api requires a "key" to be supplied');
    }
    if (!/[0-9a-f]{24}:[0-9a-f]{64}/.test(config.key)) {
        throw new Error('GhostAdminAPI Config Invalid: @tryghost/admin-api requires a "key" in following format {A}:{B}, where A is 24 hex characters and B is 64 hex characters');
    }

    const resources = [
        // @NOTE: stable
        'posts',
        'pages',
        'tags',
        // @NOTE: experimental
        'users',
        'webhooks',
        'subscribers',
        'members'
    ];

    const api = resources.reduce((apiObject, resourceType) => {
        // function add with an arguement of data and queryPrams
        function add(data, queryParams = {}) {
            // check if data is empty
            if (!data || !Object.keys(data).length) {
                return Promise.reject(new Error('Missing data'));
            }

            const mapped = {};
            //CHECK RESOUCES TYPE FROM FROM RESOURCE (STABLE AND EXPERIMENTAL)
            mapped[resourceType] = [data];

            return makeResourceRequest(resourceType, queryParams, mapped, 'POST');
        }
// it allows users to edit
        function edit(data, queryParams = {}) {
            //checks if data is supply
            if (!data) {
                // it returns a promise with an error message is the data is not found
                return Promise.reject(new Error('Missing data'));
            }
// checks for a data with id
            if (!data.id) {
                // return error messgae is a data with and id is not foound
                return Promise.reject(new Error('Must include data.id'));
            }
// assigning empty object to body and also declaring body as an object
            const body = {};
            // declaring urlParams as an object
            const urlParams = {};

            if (data.id) {
                urlParams.id = data.id;
                delete data.id;
            }
// body contains an array of data
            body[resourceType] = [data];
            
//makes request with a method of PUT
            return makeResourceRequest(resourceType, queryParams, body, 'PUT', urlParams);
        }
// function to delete, it take parameters of data and queryParams
        function del(data, queryParams = {}) {
            // checks for data
            if (!data) {
                //return a promise with error message is data is not found
                return Promise.reject(new Error('Missing data'));
            }
// checks for for data with id and email
            if (!data.id && !data.email) {
                // returns a promise with error message if data with id and email is not found
                return Promise.reject(new Error('Must include either data.id or data.email'));
            }
// assigning urlParams to data
            const urlParams = data;
            //makes request with a method of delete
            return makeResourceRequest(resourceType, queryParams, data, 'DELETE', urlParams);
        }
// function browse take a default parameter of empty object
        function browse(options = {}) {
            // calls makeResourceRequest funtion and pass the arguement of resourceType and options
            return makeResourceRequest(resourceType, options);
        }
// create funtion read with an arguement of data and queryParams
        function read(data, queryParams) {
            // check if there is data
            if (!data) {
                // return a promise with an error message if data is not found
                return Promise.reject(new Error('Missing data'));
            }
// checks for data with id, email and slug
            if (!data.id && !data.slug && !data.email) {
                //return a promise with an error message if a data  with id, slug and email is not found
                return Promise.reject(new Error('Must include either data.id or data.slug or data.email'));
            }
            
// urlParams is an object of slug,id and email
            const urlParams = {
                id: data.id,
                slug: data.slug,
                email: data.email
            };
// it delete unused and unnecessary data
            delete data.id;
            delete data.slug;
            delete data.email;

            queryParams = Object.assign({}, queryParams, data);

            return makeResourceRequest(resourceType, queryParams, {}, 'GET', urlParams);
        }

        return Object.assign(apiObject, {
            [resourceType]: {
                read,
                browse,
                add,
                edit,
                delete: del
            }
        });
    }, {});

    api.images = {
        upload(data) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            if (!(data instanceof FormData) && !data.file) {
                return Promise.reject(new Error('Must be of FormData or include path'));
            }

            let formData;
            if (data.file) {
                formData = new FormData();
                formData.append('file', fs.createReadStream(data.file));
                formData.append('purpose', data.purpose || 'image');

                if (data.ref) {
                    formData.append('ref', data.ref);
                }
            }

            return makeUploadRequest('images', formData || data, endpointFor('images/upload'));
        }
    };
// this methods a
    api.config = {
        read() {
            return makeResourceRequest('config', {}, {});
        }
    };

    api.site = {
        read() {
            return makeResourceRequest('site', {}, {});
        }
    };

    api.themes = {
        upload(data) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            if (!(data instanceof FormData) && !data.file) {
                return Promise.reject(new Error('Must be of FormData or include path'));
            }

            let formData;
            if (data.file) {
                formData = new FormData();
                formData.append('file', fs.createReadStream(data.file));
            }

            return makeUploadRequest('themes', formData || data, endpointFor('themes/upload'));
        }
    };

    return api;

    function makeUploadRequest(resourceType, data, endpoint) {
        const headers = {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`
        };

        return makeApiRequest({
            endpoint: endpoint,
            method: 'POST',
            body: data,
            headers
        }).then((data) => {
            if (!Array.isArray(data[resourceType])) {
                return data[resourceType];
            }
            if (data[resourceType].length === 1 && !data.meta) {
                return data[resourceType][0];
            }
        });
    }

    function makeResourceRequest(resourceType, queryParams = {}, body = {}, method = 'GET', urlParams = {}) {
        return makeApiRequest({
            endpoint: endpointFor(resourceType, urlParams),
            method,
            queryParams,
            body
        }).then((data) => {
            if (method === 'DELETE') {
                return data;
            }

            if (!Array.isArray(data[resourceType])) {
                return data[resourceType];
            }
            if (data[resourceType].length === 1 && !data.meta) {
                return data[resourceType][0];
            }
            return Object.assign
        }
    };(data[resourceType], {meta: data.meta});
        });
    }
//
    function endpointFor(resource, {id, slug, email} = {}) {
        const {ghostPath, version} = config;
        let endpoint = `/${ghostPath}/api/${version}/admin/${resource}/`;

        if (id) {
            endpoint = `${endpoint}${id}/`;
        } else if (slug) {
            endpoint = `${endpoint}slug/${slug}/`;
        } else if (email) {
            endpoint = `${endpoint}email/${email}/`;
        }

        return endpoint;
    }
// allows api
    function makeApiRequest({endpoint, method, body, queryParams = {}, headers = {}}) {
        const {url: apiUrl, key, version, makeRequest} = config;
        const url = `${apiUrl}${endpoint}`;

        headers = Object.assign({}, headers, {
            Authorization: `Ghost ${token(version, key)}`
        });

        return makeRequest({
            url,
            method,
            data: body,
            params: queryParams,
            headers
        }).catch((err) => {
            /**
             * @NOTE:
             *
             * If you are overriding `makeRequest`, we can't garantee that the returned format is the same, but
             * we try to detect & return a proper error instance.
             */
            if (err.response && err.response.data && err.response.data.errors) {
                const props = err.response.data.errors[0];
                const toThrow = new Error(props.message);
                const keys = Object.keys(props);

                toThrow.name = props.type;

                keys.forEach((key) => {
                    toThrow[key] = props[key];
                });

                // @TODO: bring back with a better design idea. if you log the error, the stdout is hard to read
                //        if we return the full response object, which includes also the request etc.
                // toThrow.response = err.response;
                throw toThrow;
            } else {
                delete err.request;
                delete err.config;
                delete err.response;
                throw err;
            }
        });
    }
};
