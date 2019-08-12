/**
* Returns API path combining base path and path for specific version/type
* @param {Object} options
* @param {string} options.version (v0.1, v2, canary, etc)
* @param {string} options.type (admin, content, members)
* @param {Object} options.apiVersions
* @return {string} API Path for version
*/
function getVersionPath(options) {
    let {version, type} = options;
    let versionData = options.apiVersions[version];

    if (typeof versionData === 'string') {
        versionData = options.apiVersions[versionData];
    }

    return `/${versionData[type]}/`;
}

module.exports = getVersionPath;
