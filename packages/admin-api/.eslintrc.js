module.exports = {
    plugins: ['ghost'],
    extends: [
        'plugin:ghost/node'
    ],
    rules: {
        'ghost/ghost-custom/no-native-error': 'off'
    }
};
