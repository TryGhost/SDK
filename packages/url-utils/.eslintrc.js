module.exports = {
    plugins: ['ghost'],
    extends: [
        'plugin:ghost/node'
    ],
    rules: {
        'ghost/filenames/match-regex': 'off',
        'ghost/filenames/match-exported-class': 'off'
    }
};
