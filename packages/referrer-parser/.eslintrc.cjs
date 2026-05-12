module.exports = {
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended'
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    env: {
        node: true,
        es2022: true
    },
    ignorePatterns: ['dist', '*.config.ts'],
    rules: {
        'no-console': 'warn',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'warn',
        '@typescript-eslint/no-unused-vars': ['error', { 
            'argsIgnorePattern': '^_',
            'varsIgnorePattern': '^_' 
        }]
    }
}; 