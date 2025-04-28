module.exports = {
    plugins: ['ghost', '@typescript-eslint'],
    extends: [
        'plugin:ghost/test',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
    },
    rules: {
        '@typescript-eslint/no-explicit-any': 'off', // Allow any in tests
        '@typescript-eslint/no-non-null-assertion': 'off' // Allow non-null assertions in tests
    }
};
