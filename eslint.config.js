// ESLint config for every package. ESLint looks for eslint.config.js from the
// directory it runs in upwards, so each package's `eslint .` finds this file.
const {fixupConfigRules} = require('@eslint/compat');
const {FlatCompat} = require('@eslint/eslintrc');
const js = require('@eslint/js');
const ghostPlugin = require('eslint-plugin-ghost');
const globals = require('globals');

// ESLint 9 only runs object-style rules. plugin:ghost/node enables this
// function-style one, so wrap it (`schema: false` accepts its options).
const matchExportedClass = 'filenames/match-exported-class';
if (typeof ghostPlugin.rules[matchExportedClass] === 'function') {
    ghostPlugin.rules[matchExportedClass] = {create: ghostPlugin.rules[matchExportedClass], meta: {schema: false}};
}

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended
});

/**
 * Loads an eslintrc-style config (eslint-plugin-ghost only ships those) and
 * applies it to `files` (minus `ignores`). fixupConfigRules shims context methods that rules
 * bundled in eslint-plugin-ghost (e.g. eslint-plugin-mocha 7) still call.
 */
function preset(config, files, {ignores} = {}) {
    return fixupConfigRules(compat.config(config)).map(flat => ({
        ...flat,
        // Overrides inside the preset must match their own globs as well.
        files: flat.files ? files.flatMap(file => flat.files.map(glob => [file, glob])) : files,
        ...(ignores && {ignores})
    }));
}

// Source presets skip tests, which get the test preset instead.
const notTests = {ignores: ['packages/*/test/**']};

const ghost = name => ({plugins: ['ghost'], extends: [`plugin:ghost/${name}`]});
const pkgs = (names, glob) => `packages/{${names.join(',')}}/${glob}`;

const nodePackages = ['admin-api', 'config-url-helpers', 'html-to-plaintext', 'release-utils', 'schema-org', 'social-urls', 'string'];
const esPackages = ['content-api', 'helpers'];
const tsPresetPackages = ['color-utils', 'timezone-data'];

module.exports = [
    {
        ignores: [
            '**/coverage/',
            '**/cjs/',
            '**/es/',
            '**/umd/',
            '**/dist/',
            'packages/custom-fonts/build/',
            'packages/helpers-gatsby/lib/',
            'packages/url-utils/lib/',
            'packages/referrer-parser/**/*.config.ts'
        ]
    },

    // Plain CommonJS packages
    ...preset(ghost('node'), [pkgs(nodePackages, '**/*.js')], notTests),
    {
        files: [pkgs(nodePackages, '**/*.js')],
        ...notTests,
        languageOptions: {sourceType: 'commonjs'}
    },
    {
        files: ['packages/admin-api/**/*.js'],
        rules: {'ghost/ghost-custom/no-native-error': 'off'}
    },

    // Packages built with Rollup from ES module sources
    ...preset(ghost('es'), [pkgs(esPackages, '**/*.js')], notTests),
    ...preset(ghost('ts'), [pkgs(tsPresetPackages, '**/*.js')], notTests),
    {
        files: ['packages/*/rollup.config.js'],
        languageOptions: {globals: globals.node}
    },

    ...preset({
        parser: '@typescript-eslint/parser',
        ...ghost('node')
    }, ['packages/custom-fonts/src/**/*.ts']),

    ...preset({
        plugins: ['ghost', 'react'],
        extends: ['plugin:ghost/browser', 'plugin:react/recommended'],
        parserOptions: {
            sourceType: 'module',
            ecmaFeatures: {jsx: true}
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
            'comma-dangle': ['error', {
                arrays: 'always-multiline',
                objects: 'always-multiline',
                imports: 'always-multiline',
                exports: 'always-multiline',
                functions: 'ignore'
            }],
            'react/prop-types': 'off'
        }
    }, ['packages/helpers-gatsby/src/**/*.js']),

    ...preset({
        ...ghost('ts'),
        overrides: [{
            files: ['**/*.ts'],
            rules: {
                '@typescript-eslint/ban-ts-comment': ['error', {'ts-nocheck': false}],
                '@typescript-eslint/no-var-requires': 'off',
                'prefer-const': 'off'
            }
        }]
    }, ['packages/url-utils/src/**/*.{js,ts}']),

    ...preset({
        extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint'],
        parserOptions: {ecmaVersion: 2022, sourceType: 'module'},
        env: {node: true, es2022: true},
        rules: {
            'no-console': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['error', {argsIgnorePattern: '^_', varsIgnorePattern: '^_'}]
        }
    }, ['packages/referrer-parser/*.ts', 'packages/referrer-parser/lib/**/*.ts']),

    // Tests
    ...preset(ghost('test'), ['packages/*/test/**/*.js']),
    ...preset({
        parser: '@typescript-eslint/parser',
        ...ghost('test')
    }, ['packages/custom-fonts/test/**/*.ts']),
    ...preset({
        plugins: ['ghost', '@typescript-eslint'],
        extends: ['plugin:ghost/test', 'plugin:@typescript-eslint/recommended'],
        parser: '@typescript-eslint/parser',
        parserOptions: {ecmaVersion: 2020, sourceType: 'module'},
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off'
        }
    }, ['packages/referrer-parser/test/**/*.ts']),
    {
        files: ['packages/*/test/**/*.{js,ts}'],
        languageOptions: {
            // plugin:ghost/test declares these as globals, but the tests
            // require() them, which no-redeclare reports.
            globals: {should: 'off', sinon: 'off'}
        }
    },
    {
        files: ['packages/*/test/**/*.js'],
        languageOptions: {sourceType: 'commonjs'}
    }
];
