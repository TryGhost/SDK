/* eslint-disable no-restricted-syntax */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const token = require('./token');

const packageInfo = require('../package.json');
const packageVersion = packageInfo.version;

// NOTE: bump this default when Ghost v5 is released
const defaultAcceptVersionHeader = 'v4.0';
const supportedVersions = ['v2', 'v3', 'v4', 'v5', 'canary'];
const packageName = '@tryghost/admin-api';

/**
 * This method can go away in favor of only sending 'Accept-Version` headers
 * once the Ghost API removes a concept of version from it's URLS (with Ghost v5)
 *
 * @param {string} [version] version in `v{major}` format
 * @returns {string}
 */
const resolveAPIPrefix = (version) => {
    let prefix;

    // NOTE: the "version.match(/^v5\.\d+/)" expression should be changed to "version.match(/^v\d+\.\d+/)" once Ghost v5 is out
    if (version === 'v5' || version === undefined || version.match(/^v5\.\d+/)) {
        prefix = `/admin/`;
    } else if (version.match(/^v\d+\.\d+/)) {
        const versionPrefix = /^(v\d+)\.\d+/.exec(version)[1];
        prefix = `/${versionPrefix}/admin/`;
    } else {
        prefix = `/${version}/admin/`;
    }

    return prefix;
};

/**
 *
 * @param {Object} options
 * @param {String} options.url
 * @param {String} [options.ghostPath]
 * @param {String|Boolean} options.version - a version string like v3.2, v4.1, v5.8 or boolean value identifying presence of Accept-Version header
 * @param {Function} [options.makeRequest]
 * @param {Function} [options.generateToken]
 * @param {String} [options.host] Deprecated
 */
module.exports = function GhostAdminAPI(options) {
    if (this instanceof GhostAdminAPI) {
        return GhostAdminAPI(options);
    }

    const defaultConfig = {
        ghostPath: 'ghost',
        generateToken: token,
        makeRequest({url, method, data, params = {}, headers = {}}) {
            return axios({
                url,
                method,
                params,
                data,
                headers,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                paramsSerializer(parameters) {
                    return Object.keys(parameters).reduce((parts, key) => {
                        const val = encodeURIComponent([].concat(parameters[key]).join(','));
                        return parts.concat(`${key}=${val}`);
                    }, []).join('&');
                }
            }).then((res) => {
                return res.data;
            });
        }
    };

    const config = Object.assign({}, defaultConfig, options);

    //
    /**
     * host parameter is deprecated
     * @deprecated use "url" instead
     * @example new GhostAdminAPI({host: '...'})
     */
    if (config.host) {
        // eslint-disable-next-line
        console.warn(`${packageName}: The 'host' parameter is deprecated, please use 'url' instead`);
        if (!config.url) {
            config.url = config.host;
        }
    }

    if (config.version === undefined) {
        throw new Error(`${packageName} Config Missing: 'version' is required. E.g. ${supportedVersions.join(',')}`);
    }

    if (typeof config.version === 'boolean') {
        if (config.version === true) {
            config.acceptVersionHeader = defaultAcceptVersionHeader;
        }
        config.version = undefined;
    } else if (!supportedVersions.includes(config.version) && !(config.version.match(/^v\d+\.\d+/))) {
        throw new Error(`${packageName} Config Invalid: 'version' ${config.version} is not supported`);
    } else if (supportedVersions.includes(config.version) || config.version.match(/^v\d+\.\d+/)) {
        if (config.version === 'canary') {
            // eslint-disable-next-line
            console.warn(`${packageName}: The 'version' parameter has a deprecated format 'canary', please use 'v{major}.{minor}' format instead`);

            config.acceptVersionHeader = defaultAcceptVersionHeader;
        } else if (config.version.match(/^v\d+$/)) {
            // eslint-disable-next-line
            console.warn(`${packageName}: The 'version' parameter has a deprecated format 'v{major}', please use 'v{major}.{minor}' format instead`);

            // CASE: all the v1, v2, v4 ... strings should be normalized to fit 'v{major}.{minor}' format
            config.acceptVersionHeader = `${config.version}.0`;
        } else {
            config.acceptVersionHeader = config.version;
        }
    }

    if (!config.url) {
        throw new Error(`${packageName} Config Missing: 'url' is required. E.g. 'https://site.com'`);
    }
    if (!/https?:\/\//.test(config.url)) {
        throw new Error(`${packageName} Config Invalid: 'url' ${config.url} requires a protocol. E.g. 'https://site.com'`);
    }
    if (config.url.endsWith('/')) {
        throw new Error(`${packageName} Config Invalid: 'url' ${config.url} must not have a trailing slash. E.g. 'https://site.com'`);
    }
    if (config.ghostPath.endsWith('/') || config.ghostPath.startsWith('/')) {
        throw new Error(`${packageName} Config Invalid: 'ghostPath' ${config.ghostPath} must not have a leading or trailing slash. E.g. 'ghost'`);
    }
    if (!config.key) {
        throw new Error(`${packageName} Config Invalid: 'key' ${config.key} must have 26 hex characters`);
    }
    if (!/[0-9a-f]{24}:[0-9a-f]{64}/.test(config.key)) {
        throw new Error(`${packageName} Config Invalid: 'key' ${config.key} must have the following format {A}:{B}, where A is 24 hex characters and B is 64 hex characters`);
    }

    const resources = [
        'posts',
        'pages',
        'tags',
        'webhooks',
        'members',
        'users'
    ];

    if (typeof config.version === 'string' && config.version.startsWith('v2')) {
        resources.push('subscribers');
    }

    const api = resources.reduce((apiObject, resourceType) => {
        function add(data, queryParams = {}) {
            if (!data || !Object.keys(data).length) {
                return Promise.reject(new Error('Missing data'));
            }

            const mapped = {};
            mapped[resourceType] = [data];

            return makeResourceRequest(resourceType, queryParams, mapped, 'POST');
        }

        function edit(data, queryParams = {}) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            if (!data.id) {
                return Promise.reject(new Error('Must include data.id'));
            }

            const body = {};
            const urlParams = {};

            if (data.id) {
                urlParams.id = data.id;
                delete data.id;
            }

            body[resourceType] = [data];

            return makeResourceRequest(resourceType, queryParams, body, 'PUT', urlParams);
        }

        function del(data, queryParams = {}) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            if (!data.id && !data.email) {
                return Promise.reject(new Error('Must include either data.id or data.email'));
            }

            const urlParams = data;

            return makeResourceRequest(resourceType, queryParams, data, 'DELETE', urlParams);
        }

        function browse(opts = {}) {
            return makeResourceRequest(resourceType, opts);
        }

        function read(data, queryParams) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            if (!data.id && !data.slug && !data.email) {
                return Promise.reject(new Error('Must include either data.id or data.slug or data.email'));
            }

            const urlParams = {
                id: data.id,
                slug: data.slug,
                email: data.email
            };

            delete data.id;
            delete data.slug;
            delete data.email;

            queryParams = Object.assign({}, queryParams, data);

            return makeResourceRequest(resourceType, queryParams, {}, 'GET', urlParams);
        }

        let resourceAPI = {};
        if (resourceType === 'webhooks') {
            resourceAPI = {
                [resourceType]: {
                    add,
                    edit,
                    delete: del
                }
            };
        } else {
            resourceAPI = {
                [resourceType]: {
                    read,
                    browse,
                    add,
                    edit,
                    delete: del
                }
            };
        }

        return Object.assign(apiObject, resourceAPI);
    }, {});

    function isValidUpload(data) {
        if (data instanceof FormData) {
            return true;
        }

        if (data.file) {
            return true;
        }

        return false;
    }

    function getFormData(data) {
        let formData;

        if (data instanceof FormData) {
            return data;
        }

        if (data.file) {
            formData = new FormData();
            formData.append('file', fs.createReadStream(data.file));
            // NOTE: this default "image" doesn't work for all upload endpoints. Should be moved from here and required as
            //       an explicit method parameter. Leaving it here for now as I'm focusing on a different problem.
            formData.append('purpose', data.purpose || 'image');

            if (data.ref) {
                formData.append('ref', data.ref);
            }

            if (data.thumbnail) {
                formData.append('thumbnail', fs.createReadStream(data.thumbnail));
            }

            return formData;
        }
    }

    api.images = {
        upload(data) {
            return makeUploadRequest('images', data, endpointFor('images/upload'));
        }
    };

    api.media = {
        /**
         *
         * @param {Object} data
         * @param {String} data.file - file path to a media file
         * @param {String} [data.thumbnail] - file path to a thumbnail file
         * @param {String} [data.purpose]
         * @returns Promise<Object>
         */
        upload(data) {
            return makeUploadRequest('media', data, endpointFor('media/upload'));
        }
    };

    api.files = {
        /**
         *
         * @param {Object} data
         * @param {String} data.file - file path to a media file
         * @param {String} [data.ref] - reference field returned in the response
         * @returns Promise<Object>
         */
        upload(data) {
            return makeUploadRequest('files', data, endpointFor('files/upload'));
        }
    };

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
            return makeUploadRequest('themes', data, endpointFor('themes/upload'));
        },
        activate(name) {
            if (!name) {
                return Promise.reject(new Error('Missing theme name'));
            }

            return makeResourceRequest('themes', {}, {}, 'PUT', {id: `${name}/activate`});
        }
    };

    return api;

    function makeUploadRequest(resourceType, data, endpoint) {
        if (!data) {
            return Promise.reject(new Error('Missing data'));
        }

        if (!isValidUpload(data)) {
            return Promise.reject(new Error('Must be of FormData or include path'));
        }

        let formData = getFormData(data);

        const headers = {
            'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
        };

        return makeApiRequest({
            endpoint: endpoint,
            method: 'POST',
            body: formData,
            headers
        }).then((apiData) => {
            if (!Array.isArray(apiData[resourceType])) {
                return apiData[resourceType];
            }
            if (apiData[resourceType].length === 1 && !apiData.meta) {
                return apiData[resourceType][0];
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
            return Object.assign(data[resourceType], {meta: data.meta});
        });
    }

    function endpointFor(resource, {id, slug, email} = {}) {
        const {ghostPath, version} = config;

        const apiPrefix = resolveAPIPrefix(version);
        let endpoint = `/${ghostPath}/api${apiPrefix}${resource}/`;

        if (id) {
            endpoint = `${endpoint}${id}/`;
        } else if (slug) {
            endpoint = `${endpoint}slug/${slug}/`;
        } else if (email) {
            endpoint = `${endpoint}email/${email}/`;
        }

        return endpoint;
    }

    function makeApiRequest({endpoint, method, body, queryParams = {}, headers = {}}) {
        const {url: apiUrl, key, version, makeRequest} = config;
        const url = `${apiUrl}${endpoint}`;

        let authorizationHeader;
        const audience = resolveAPIPrefix(version);
        authorizationHeader = `Ghost ${config.generateToken(key, audience)}`;

        const ghostHeaders = {
            Authorization: authorizationHeader,
            'User-Agent': `GhostAdminSDK/${packageVersion}`
        };

        if (config.acceptVersionHeader) {
            ghostHeaders['Accept-Version'] = config.acceptVersionHeader;
        }

        headers = Object.assign({}, headers, ghostHeaders);

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
             * If you are overriding `makeRequest`, we can't garante that the returned format is the same, but
             * we try to detect & return a proper error instance.
             */
            if (err.response && err.response.data && err.response.data.errors) {
                const props = err.response.data.errors[0];
                const toThrow = new Error(props.message);
                const keys = Object.keys(props);

                toThrow.name = props.type;

                keys.forEach((k) => {
                    toThrow[k] = props[k];
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
