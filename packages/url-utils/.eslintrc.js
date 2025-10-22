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
                'no-undef': 'off',
                // TypeScript supports method overloads which ESLint sees as duplicates
                'no-dupe-class-members': 'off',
                // TypeScript files use PascalCase for classes and kebab-case for filenames
                'ghost/filenames/match-regex': 'off',
                'ghost/filenames/match-exported-class': 'off'
            }
        }
    ]
};
