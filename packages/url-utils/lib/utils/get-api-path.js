const getVersionPath = require('./get-version-path');

/**
* Returns API path combining base path and path for specific version/type
* @param {Object} options
* @param {string} options.version (v2, v3, v4, canary, etc)
* @param {string} options.type (admin, content, members)
* @param {string} options.baseApiPath
* @param {Object} options.apiVersions
* @return {string} API Path for version
*/
function getApiPath(options) {
    const versionPath = getVersionPath(options);

    return `${options.baseApiPath}${versionPath}`;
}

module.exports = getApiPath;
