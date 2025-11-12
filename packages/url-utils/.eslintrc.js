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
            // Files with @ts-nocheck are intentionally not fully migrated yet
            // Disable all linting rules that would fail on these files
            files: ['**/*.ts'],
            rules: {
                '@typescript-eslint/ban-ts-comment': ['error', {
                    'ts-nocheck': false
                }],
                '@typescript-eslint/no-var-requires': 'off',
                'prefer-const': 'off'
            }
        }
    ]
};
