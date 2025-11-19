module.exports = {
    plugins: ['ghost'],
    extends: [
        'plugin:ghost/ts'
    ],
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
