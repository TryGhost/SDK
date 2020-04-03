module.exports = {
    plugins: ['ghost', 'react'],
    extends: [
        'plugin:ghost/browser',
        'plugin:react/recommended'
    ],
    parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true
        },
    },
    settings: {
        react: {
            createClass: 'createReactClass',
            pragma: 'React',
            version: '16.0',
            flowVersion: '0.53'
        },
    },
    rules: {
        semi: ['error', 'never'],
        'object-curly-spacing': ['error', 'always'],
         'comma-dangle': [
             'error',
             {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'ignore'
            }
        ],
        // Not sure why this isn't working
        'react/prop-types': ['off']
    }
};
