const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const token = require('./token');

// supported Versions
const supportedVersions = ['v2', 'v3', 'canary'];
const name = '@tryghost/admin-api';

// Export the GhostAdminAPI instance
module.exports = function GhostAdminAPI(options) {
    // test if the prototype property of the constructor appears anywhere in the prototype chain of GhostAdminAPI.
    if (this instanceof GhostAdminAPI) {
        return GhostAdminAPI(options);
    }

    // defaultConfig (Object)
    const defaultConfig = {
        // ghostPath (property)
        ghostPath: 'ghost',
        // makeRequest (method)
        // using es5 destructured parameters
        // params and headers are optional parameters with an empty object as default value
        makeRequest({url, method, data, params = {}, headers = {}}) {
            // axios: Promise based HTTP client for the browser and node.js
            // Requests can be made by passing the relevant config to axios i.e axios(config)
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

    //copy all enumerable own properties from defaultConfig and options to an empty object and assign it to config.
    const config = Object.assign({}, defaultConfig, options);

    // new GhostAdminAPI({host: '...'}) is deprecated
    
    if (config.host) {
        // eslint-disable-next-line
        console.warn(`${name}: The 'host' parameter is deprecated, please use 'url' instead`);
        if (!config.url) {
            config.url = config.host;
        }
    }
    //set formatResponse to true if not added to the option
    if (config.formatResponse === {} || config.formatResponse === undefined) {
        config.formatResponse = true;
    }
    // Ensure a version is supplied
    if (!config.version) {
        throw new Error(`${name} Config Missing: 'version' is required. E.g. ${supportedVersions.join(',')}`);
    }

    // Ensure supplied version is supported
    if (!supportedVersions.includes(config.version)) {
        throw new Error(`${name} Config Invalid: 'version' ${config.version} is not supported`);
    }

    // Ensure config is url specified
    if (!config.url) {
        throw new Error(`${name} Config Missing: 'url' is required. E.g. 'https://site.com'`);
    }

    // regex test if specified config url is valid
    if (!/https?:\/\//.test(config.url)) {
        throw new Error(`${name} Config Invalid: 'url' ${config.url} requires a protocol. E.g. 'https://site.com'`);
    }

    // check for trailing slash in url
    if (config.url.endsWith('/')) {
        throw new Error(`${name} Config Invalid: 'url' ${config.url} must not have a trailing slash. E.g. 'https://site.com'`);
    }

    // check for leading or trailing slash in url
    if (config.ghostPath.endsWith('/') || config.ghostPath.startsWith('/')) {
        throw new Error(`${name} Config Invalid: 'ghostPath' ${config.ghostPath} must not have a leading or trailing slash. E.g. 'ghost'`);
    }

    // Ensure key is supplied to config
    if (!config.key) {
        throw new Error(`${name} Config Invalid: 'key' ${config.key} must have 26 hex characters`);
    }

    // validate key format
    if (!/[0-9a-f]{24}:[0-9a-f]{64}/.test(config.key)) {
        throw new Error(`${name} Config Invalid: 'key' ${config.key} must have the following format {A}:{B}, where A is 24 hex characters and B is 64 hex characters`);
    }

    // resources currently supported
    // stable and experimental resources
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

    /**
     * The api has 9 methods to for making api calls
     *
     */

    //copy all enumerable own properties from each resource and options apiObject
    const api = resources.reduce((apiObject, resourceType) => {
        // add function with params data, and queryParams default to an object
        function add(data, queryParams = {}) {
            // test if data is undefined or empty
            if (!data || !Object.keys(data).length) {
                // returns a Promise that is rejected with
                return Promise.reject(new Error('Missing data'));
            }

            const mapped = {};
            // assign data as an array to mapped object on the resourceType index
            mapped[resourceType] = [data];

            // finally make the request calling makeResourceRequest()
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

        function browse(options = {}) {
            return makeResourceRequest(resourceType, options);
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

        // assigns the current resource from the resources array, as an array with the functions declared above as methods to the apiObject i.e the accumulator
        // [resourceType] is a variable, from resources i.e the previous value
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
            formData.append('purpose', data.purpose || 'image');

            if (data.ref) {
                formData.append('ref', data.ref);
            }

            return formData;
        }
    }

    api.images = {
        upload(data) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            if (!isValidUpload(data)) {
                return Promise.reject(new Error('Must be of FormData or include path'));
            }

            let formData = getFormData(data);

            return makeUploadRequest('images', formData, endpointFor('images/upload'));
        }
    };

    // method to read config
    api.config = {
        read() {
            return makeResourceRequest('config', {}, {});
        }
    };

    // method to read site
    api.site = {
        read() {
            return makeResourceRequest('site', {}, {});
        }
    };

    // method to upload themes
    api.themes = {
        upload(data) {
            if (!data) {
                return Promise.reject(new Error('Missing data'));
            }

            if (!isValidUpload(data)) {
                return Promise.reject(new Error('Must be of FormData or include path'));
            }

            let formData = getFormData(data);

            return makeUploadRequest('themes', formData, endpointFor('themes/upload'));
        },
        activate(name) {
            if (!name) {
                return Promise.reject(new Error('Missing theme name'));
            }

            return makeResourceRequest('themes', {}, {}, 'PUT', {id: `${name}/activate`});
        }
    };

    return api;

    //this function is used to upload  a resource to an endpoint
    //the resource type can be a post, page, an image, a theme,
    //the function is taking in three parameters, which are the resourcetype(the type of what you want to upload), data(the payload i.e file), endpoint(the route you want to upload to)
    function makeUploadRequest(resourceType, data, endpoint) {
        //the headers which is the content type with a boundaryUnauthorized
        const headers = {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`
        };
        //the makeAPIREQUEST is been called here which take the parameters of makeUploadRequest as an arguement
        return makeApiRequest({
            endpoint: endpoint,
            method: 'POST',
            body: data,
            headers
        })
            //return a promise data
            .then((data) => {
                if (config.formatResponse === true) {
                    if (!Array.isArray(data[resourceType])) {
                        return data[resourceType];
                    }
    
                    if (data[resourceType].length === 1 && !data.meta) {
                        return data[resourceType][0];
                    }
                } else {
                    return data;
                }
            });
    }

    // function makeResourceRequest
    function makeResourceRequest(resourceType, queryParams = {}, body = {}, method = 'GET', urlParams = {}) {
        // make the api request
        return makeApiRequest({
            endpoint: endpointFor(resourceType, urlParams),
            method,
            queryParams,
            body
        }).then((data) => {
            // return data if method is 'DELETE', 'GET' in the default
            if (method === 'DELETE') {
                return data;
            }
            if (config.formatResponse === true) {
            // return data[resourceType] if it is not an array
                if (!Array.isArray(data[resourceType])) {
                    return data[resourceType];
                }
                // return data[resourceType[0] index of data if data[resourceType] length equals 1 ans data.meta is undefined
                if (data[resourceType].length === 1 && !data.meta) {
                    return data[resourceType][0];
                }
                //copy the values of all of the enumerable own properties from data.meta as meta data[resourceType]. Returns data[resourceType]
                return Object.assign(data[resourceType], {meta: data.meta});
            } else {
                return Object.assign(data, {meta: data.meta});
            }
        });
    }

    // function endpointFor: returns an endpoint for api request
    function endpointFor(resource, {id, slug, email} = {}) {
        // destructure values from config
        const {ghostPath, version} = config;
        // default endpoint
        let endpoint = `/${ghostPath}/api/${version}/admin/${resource}/`;

        // if id is supplied then endpoint points to the supplied id
        if (id) {
            endpoint = `${endpoint}${id}/`;
            // if  id is not supplied check if slug is supplied and point to the supplied slug
        } else if (slug) {
            endpoint = `${endpoint}slug/${slug}/`;
            // if id and slug are not supplied check if email is supplied and point to the supplied email
        } else if (email) {
            endpoint = `${endpoint}email/${email}/`;
        }
        // return endpoint, default endpoint is returned if neither id, slug, nor email is supplied
        return endpoint;
    }

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
