const fs = require('fs');
const os = require('os');
const _ = require('lodash');
const axios = require('axios');

const localUtils = require('./utils');

module.exports.create = (options = {}) => {
    let draft = true;
    let prerelease = false;

    localUtils.checkMissingOptions(options,
        'changelogPath',
        'github',
        'github.token',
        'userAgent',
        'uri',
        'tagName',
        'releaseName'
    );

    if (Object.prototype.hasOwnProperty.call(options, 'draft')) {
        draft = options.draft;
    }

    if (Object.prototype.hasOwnProperty.call(options, 'prerelease')) {
        prerelease = options.prerelease;
    }

    let body = [];
    // CASE: changelogPath can be array of paths with content
    if (_.isArray(options.changelogPath)) {
        options.changelogPath.forEach((opts) => {
            body = body.concat(localUtils.getFinalChangelog(opts));
        });
    } else {
        // CASE: changelogPath can be a single path(For backward compatibility)
        body = body.concat(localUtils.getFinalChangelog(options));
    }

    // CASE: clean before upload
    body = body.filter((item) => {
        return item !== undefined;
    });

    if (options.gistUrl) {
        body.push('');
        body.push('You can see the [full change log](' + options.gistUrl + ') for the details of every change included in this release.');
    }

    if (options.extraText) {
        body.push('');
        body.push(options.extraText);
    }

    const auth = 'token ' + options.github.token;

    return axios({
        url: options.uri,
        method: 'POST',
        headers: {
            'User-Agent': options.userAgent,
            Authorization: auth
        },
        data: {
            tag_name: options.tagName,
            target_commitish: options.targetRef || 'main',
            name: options.releaseName,
            body: body.join(os.EOL),
            draft: draft,
            prerelease: prerelease
        }
    }).then((response) => {
        return {
            id: response.data.id,
            releaseUrl: response.data.html_url,
            uploadUrl: response.data.upload_url
        };
    });
};

module.exports.uploadZip = (options = {}) => {
    localUtils.checkMissingOptions(options,
        'zipPath',
        'github',
        'github.token',
        'userAgent',
        'uri'
    );

    const auth = 'token ' + options.github.token;
    const stats = fs.statSync(options.zipPath);

    return axios({
        url: options.uri,
        method: 'POST',
        headers: {
            'User-Agent': options.userAgent,
            Authorization: auth,
            'Content-Type': 'application/zip',
            'Content-Length': stats.size
        },
        data: fs.createReadStream(options.zipPath),
        maxContentLength: Infinity,
        maxBodyLength: Infinity
    }).then((response) => {
        return {
            downloadUrl: response.data.browser_download_url
        };
    });
};

module.exports.get = (options = {}) => {
    localUtils.checkMissingOptions(options,
        'userAgent',
        'uri'
    );

    return axios({
        url: options.uri,
        method: 'GET',
        headers: {
            'User-Agent': options.userAgent
        }
    }).then((response) => {
        return response.data;
    });
};
