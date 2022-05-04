import axios from 'axios';
import packageInfo from '../package.json';

const packageVersion = packageInfo.version;

// NOTE: bump this default when Ghost v5 is released
const defaultAcceptVersionHeader = 'v4.0';
const supportedVersions = ['v2', 'v3', 'v4', 'v5', 'canary'];
const name = '@tryghost/content-api';

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
        prefix = `/content/`;
    } else if (version.match(/^v\d+\.\d+/)) {
        const versionPrefix = /^(v\d+)\.\d+/.exec(version)[1];
        prefix = `/${versionPrefix}/content/`;
    } else {
        prefix = `/${version}/content/`;
    }

    return prefix;
};

const defaultMakeRequest = ({url, method, params, headers}) => {
    return axios[method](url, {
        params,
        paramsSerializer: (parameters) => {
            return Object.keys(parameters).reduce((parts, k) => {
                const val = encodeURIComponent([].concat(parameters[k]).join(','));
                return parts.concat(`${k}=${val}`);
            }, []).join('&');
        },
        headers
    });
};

/**
 *
 * @param {Object} options
 * @param {String} options.url
 * @param {String} options.key
 * @param {String} [options.ghostPath]
 * @param {String|Boolean} options.version - a version string like v3, v4, v5 or boolean value identifying presence of Accept-Version header
 * @param {Function} [options.makeRequest]
 * @param {String} [options.host] Deprecated
 */
export default function GhostContentAPI({url, key, host, version, ghostPath = 'ghost', makeRequest = defaultMakeRequest}) {
    /**
     * host parameter is deprecated
     * @deprecated use "url" instead
     */
    if (host) {
        // eslint-disable-next-line
        console.warn(`${name}: The 'host' parameter is deprecated, please use 'url' instead`);
        if (!url) {
            url = host;
        }
    }

    if (this instanceof GhostContentAPI) {
        return GhostContentAPI({url, key, version, ghostPath, makeRequest});
    }

    if (version === undefined) {
        throw new Error(`${name} Config Missing: 'version' is required. E.g. ${supportedVersions.join(',')}`);
    }

    let acceptVersionHeader;
    if (typeof version === 'boolean') {
        if (version === true) {
            acceptVersionHeader = defaultAcceptVersionHeader;
        }
        version = undefined;
    } else if (version && !supportedVersions.includes(version) && !(version.match(/^v\d+\.\d+/))) {
        throw new Error(`${name} Config Invalid: 'version' ${version} is not supported`);
    } else {
        if (version === 'canary') {
            // eslint-disable-next-line
            console.warn(`${name}: The 'version' parameter has a deprecated format 'canary', please use 'v{major}.{minor}' format instead`);

            acceptVersionHeader = defaultAcceptVersionHeader;
        } else if (version.match(/^v\d+$/)) {
            // eslint-disable-next-line
            console.warn(`${name}: The 'version' parameter has a deprecated format 'v{major}', please use 'v{major}.{minor}' format instead`);

            acceptVersionHeader = `${version}.0`;
        } else {
            acceptVersionHeader = version;
        }
    }

    if (!url) {
        throw new Error(`${name} Config Missing: 'url' is required. E.g. 'https://site.com'`);
    }
    if (!/https?:\/\//.test(url)) {
        throw new Error(`${name} Config Invalid: 'url' ${url} requires a protocol. E.g. 'https://site.com'`);
    }
    if (url.endsWith('/')) {
        throw new Error(`${name} Config Invalid: 'url' ${url} must not have a trailing slash. E.g. 'https://site.com'`);
    }
    if (ghostPath.endsWith('/') || ghostPath.startsWith('/')) {
        throw new Error(`${name} Config Invalid: 'ghostPath' ${ghostPath} must not have a leading or trailing slash. E.g. 'ghost'`);
    }
    if (key && !/[0-9a-f]{26}/.test(key)) {
        throw new Error(`${name} Config Invalid: 'key' ${key} must have 26 hex characters`);
    }
    const api = ['posts', 'authors', 'tags', 'pages', 'settings'].reduce((apiObject, resourceType) => {
        function browse(options = {}, memberToken) {
            return makeApiRequest(resourceType, options, null, memberToken);
        }
        function read(data, options = {}, memberToken) {
            if (!data || !data.id && !data.slug) {
                return Promise.reject(new Error(`${name} read requires an id or slug.`));
            }

            const params = Object.assign({}, data, options);

            return makeApiRequest(resourceType, params, data.id || `slug/${data.slug}`, memberToken);
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

    function makeApiRequest(resourceType, params, id, membersToken = null) {
        if (!membersToken && !key) {
            return Promise.reject(
                new Error(`${name} Config Missing: 'key' is required.`)
            );
        }
        delete params.id;

        const headers = membersToken ? {
            Authorization: `GhostMembers ${membersToken}`
        } : {};

        headers['User-Agent'] = `GhostContentSDK/${packageVersion}`;
        if (acceptVersionHeader) {
            headers['Accept-Version'] = acceptVersionHeader;
        }

        params = Object.assign({key}, params);
        const apiUrl = `${url}/${ghostPath}/api${resolveAPIPrefix(version)}${resourceType}/${id ? id + '/' : ''}`;

        return makeRequest({
            url: apiUrl,
            method: 'get',
            params,
            headers
        })
            .then((res) => {
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

                    keys.forEach((k) => {
                        toThrow[k] = props[k];
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
