/* eslint-env node */
module.exports = {
    plugins: ['ghost'],
    extends: [
        'plugin:ghost/ts'
    ],
    rules: {
        // Allow 'any' types for backward compatibility with existing API
        '@typescript-eslint/no-explicit-any': 'warn',
        // Allow unused vars that start with underscore (common pattern for intentionally unused params)
        '@typescript-eslint/no-unused-vars': ['error', {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_'
        }]
    },
    overrides: [
        {
            files: ['test/**/*.js'],
            rules: {
                // Allow require statements in test files
                '@typescript-eslint/no-var-requires': 'off'
            }
        }
    ]
};
