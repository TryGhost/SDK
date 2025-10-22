module.exports = {
    plugins: ['ghost'],
    extends: [
        'plugin:ghost/node'
    ],
    overrides: [
        {
            files: ['*.ts'],
            parser: '@typescript-eslint/parser',
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: 'module'
            },
            rules: {
                // Disable rules that conflict with TypeScript
                'no-unused-vars': 'off',
                'no-undef': 'off'
            }
        }
    ]
};
