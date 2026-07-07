module.exports = {
    get Changelog() {
        return require('./Changelog');
    },

    get releases() {
        return require('./releases');
    },

    get gist() {
        return require('./gist');
    },

    get utils() {
        return require('./utils');
    }
};
