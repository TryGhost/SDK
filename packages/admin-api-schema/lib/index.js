module.exports.utils = {
    validate: require('./utils/validate')
};

module.exports.schema = {
    v2: function (name) {
        return require(`./schema/v2/${name}.json`);
    }
};
