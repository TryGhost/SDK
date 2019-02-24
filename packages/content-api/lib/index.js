import axios from 'axios';

const supportedVersions = ['v2'];

export default function GhostContentAPI({url, host, ghostPath = 'ghost', version, key}) {
    // host parameter is deprecated
    if (host) {
        // eslint-disable-next-line
        console.warn('GhostAdminAPI\'s `host` parameter is deprecated, please use `url` instead');
        if (!url) {
            url = host;
        }
    }

    if (this instanceof GhostContentAPI) {
        return GhostContentAPI({url, version, key});
    }

    if (!version) {
        throw new Error('GhostContentAPI Config Missing: @tryghost/content-api requires a "version" like "v2"');
    }
    if (!supportedVersions.includes(version)) {
        throw new Error('GhostContentAPI Config Invalid: @tryghost/content-api does not support the supplied version');
    }
    if (!url) {
        throw new Error('GhostContentAPI Config Missing: @tryghost/content-api requires a "url" like "https://site.com" or "https://site.com/blog"');
    }
    if (!/https?:\/\//.test(url)) {
        throw new Error('GhostContentAPI Config Invalid: @tryghost/content-api requires a "url" with a protocol like "https://site.com" or "https://site.com/blog"');
    }
    if (url.endsWith('/')) {
        throw new Error('GhostContentAPI Config Invalid: @tryghost/content-api requires a "url" without a trailing slash like "https://site.com" or "https://site.com/blog"');
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

    function makeRequest(resourceType, params, id, membersToken = null) {
        if (!membersToken && !key) {
            return Promise.reject(
                new Error('GhostContentAPI Config Missing: @tryghost/content-api was instantiated without a content key')
            );
        }
        delete params.id;

        const headers = membersToken ? {
            Authorization: `GhostMembers ${membersToken}`
        } : undefined;

        return axios.get(`${url}/${ghostPath}/api/${version}/content/${resourceType}/${id ? id + '/' : ''}`, {
            params: Object.assign({key}, params),
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
        }).catch((err) => {
            if (err.response && err.response.data && err.response.data.errors) {
                const props = err.response.data.errors[0];
                const toThrow = new Error(props.message);
                const keys = Object.keys(props);

                toThrow.name = props.type;

                keys.forEach((key) => {
                    toThrow[key] = props[key];
                });

                toThrow.response = err.response;

                // @TODO: remove in 2.0. We have enhanced the error handling, but we don't want to break existing implementations.
                toThrow.request = err.request;
                toThrow.config = err.config;

                throw toThrow;
            } else {
                throw err;
            }
        });
    }
}
