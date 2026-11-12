// ESLint config for every package. ESLint 9 looks for eslint.config.js from
// the directory it runs in upwards, so each package's `eslint .` finds this
// file. Keeping it out of the packages also keeps it out of their coverage.
const {eslintrc, inPackage, nodeEnv} = require('./eslint.shared');

module.exports = [
    ...inPackage('admin-api', [
        {
            ignores: ['coverage/**']
        },
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/node'],
            rules: {
                'ghost/ghost-custom/no-native-error': 'off'
            }
        }, {files: ['**/*.js'], ignores: ['test/**']}),
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.js']})
    ]),
    ...inPackage('color-utils', [
        {
            ignores: ['coverage/**', 'cjs/**', 'umd/**', 'es/**']
        },
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/ts']
        }, {files: ['**/*.js'], ignores: ['test/**']}),
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.js']}),
        ...nodeEnv(['rollup.config.js'])
    ]),
    ...inPackage('config-url-helpers', [
        {
            ignores: ['coverage/**']
        },
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/node']
        }, {files: ['**/*.js'], ignores: ['test/**']}),
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.js']})
    ]),
    ...inPackage('content-api', [
        {
            ignores: ['coverage/**', 'cjs/**', 'umd/**', 'es/**']
        },
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/es']
        }, {files: ['**/*.js'], ignores: ['test/**']}),
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.js']}),
        ...nodeEnv(['rollup.config.js'])
    ]),
    ...inPackage('custom-fonts', [
        {
            ignores: ['coverage/**', 'build/**']
        },
        ...eslintrc({
            parser: '@typescript-eslint/parser',
            plugins: ['ghost'],
            extends: ['plugin:ghost/node']
        }, {files: ['src/**/*.ts'], ignores: ['test/**']}),
        ...eslintrc({
            parser: '@typescript-eslint/parser',
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.ts']})
    ]),
    ...inPackage('helpers-gatsby', [
        {
            ignores: ['lib/**', 'coverage/**']
        },
        ...eslintrc({
            plugins: ['ghost', 'react'],
            extends: [
                'plugin:ghost/browser',
                'plugin:react/recommended'
            ],
            parserOptions: {
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            },
            settings: {
                react: {
                    createClass: 'createReactClass',
                    pragma: 'React',
                    version: '16.0',
                    flowVersion: '0.53'
                }
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
                'react/prop-types': ['off']
            }
        }, {files: ['**/*.js'], ignores: ['test/**']}),
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.js']})
    ]),
    ...inPackage('helpers', [
        {
            ignores: ['coverage/**', 'cjs/**', 'umd/**', 'es/**']
        },
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/es']
        }, {files: ['**/*.js'], ignores: ['test/**']}),
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.js']})
    ]),
    ...inPackage('html-to-plaintext', [
        {
            ignores: ['coverage/**']
        },
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/node']
        }, {files: ['*.js', 'lib/**/*.js']}),
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.js']})
    ]),
    ...inPackage('referrer-parser', [
        {
            // Only TypeScript sources are linted (previously `eslint *.ts lib/ test/ --ext .ts`).
            ignores: ['**/dist/', '**/*.config.ts', 'coverage/**']
        },
        ...eslintrc({
            extends: [
                'eslint:recommended',
                'plugin:@typescript-eslint/recommended'
            ],
            parser: '@typescript-eslint/parser',
            plugins: ['@typescript-eslint'],
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module'
            },
            env: {
                node: true,
                es2022: true
            },
            rules: {
                'no-console': 'warn',
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/no-explicit-any': 'warn',
                '@typescript-eslint/no-unused-vars': ['error', {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_'
                }]
            }
        }, {files: ['*.ts', 'lib/**/*.ts'], ignores: ['test/**']}),
        ...eslintrc({
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
        }, {files: ['test/**/*.ts']})
    ]),
    ...inPackage('release-utils', [
        {
            ignores: ['coverage/**']
        },
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/node']
        }, {files: ['**/*.js'], ignores: ['test/**']}),
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.js']})
    ]),
    ...inPackage('schema-org', [
        {
            ignores: ['coverage/**']
        },
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/node']
        }, {files: ['**/*.js'], ignores: ['test/**']}),
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.js']})
    ]),
    ...inPackage('social-urls', [
        {
            ignores: ['coverage/**']
        },
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/node']
        }, {files: ['**/*.js'], ignores: ['test/**']}),
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.js']})
    ]),
    ...inPackage('string', [
        {
            ignores: ['coverage/**']
        },
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/node']
        }, {files: ['**/*.js'], ignores: ['test/**']}),
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.js']})
    ]),
    ...inPackage('timezone-data', [
        {
            ignores: ['coverage/**', 'cjs/**', 'umd/**', 'es/**']
        },
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/ts']
        }, {files: ['**/*.js'], ignores: ['test/**']}),
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.js']}),
        ...nodeEnv(['rollup.config.js'])
    ]),
    ...inPackage('url-utils', [
        {
            ignores: ['coverage/**', 'lib/**']
        },
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/ts'],
            overrides: [
                {
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
        }, {files: ['src/**/*.js', 'src/**/*.ts']}),
        ...eslintrc({
            plugins: ['ghost'],
            extends: ['plugin:ghost/test']
        }, {files: ['test/**/*.js', 'test/**/*.ts']})
    ])
];
