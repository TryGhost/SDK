const fs = require('fs');
const axios = require('axios');

const localUtils = require('./utils');

module.exports.create = (options = {}) => {
    let isPublic = true;

    localUtils.checkMissingOptions(options,
        'changelogPath',
        'gistName',
        'gistDescription',
        'github',
        'github.token',
        'userAgent'
    );

    if (Object.prototype.hasOwnProperty.call(options, 'isPublic')) {
        isPublic = options.isPublic;
    }

    const content = fs.readFileSync(options.changelogPath);
    const files = {};

    files[options.gistName] = {
        content: content.toString('utf8')
    };

    const auth = 'token ' + options.github.token;

    return axios({
        url: 'https://api.github.com/gists',
        method: 'POST',
        headers: {
            'User-Agent': options.userAgent,
            Authorization: auth
        },
        data: {
            description: options.gistDescription,
            public: isPublic,
            files: files
        }
    }).then((response) => {
        return {
            gistUrl: response.data.html_url
        };
    });
};
