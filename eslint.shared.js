// Helpers for the root eslint.config.js.
//
// eslint-plugin-ghost only ships eslintrc-style presets (plugin:ghost/node,
// /test, /ts, /es, /browser). FlatCompat loads them unchanged, so each package
// keeps the exact rules it had under ESLint 8. Some rules it bundles (e.g.
// eslint-plugin-mocha 7) still call context methods ESLint 9 removed;
// fixupConfigRules shims those.
const {fixupConfigRules} = require('@eslint/compat');
const {FlatCompat} = require('@eslint/eslintrc');
const js = require('@eslint/js');
const ghostPlugin = require('eslint-plugin-ghost');

// ESLint 9 only runs object-style rules, and validates options against each
// rule's schema. eslint-plugin-ghost wraps most of its bundled function-style
// rules but not these two; plugin:ghost/node enables match-exported-class with
// options. `schema: false` keeps those options exactly as they were.
for (const name of ['filenames/match-exported', 'filenames/match-exported-class']) {
    const rule = ghostPlugin.rules[name];

    if (typeof rule === 'function') {
        ghostPlugin.rules[name] = {create: rule, meta: {schema: false}};
    }
}

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended
});

/**
 * ESLint 8 defaults that flat config changed, as a config object for the
 * start of a scope:
 * - eslintrc parsed files as scripts unless a config said otherwise, with
 *   `globalReturn` under the node env. Flat config treats .js as modules and
 *   spells "script + globalReturn" as `sourceType: 'commonjs'`. This changes
 *   scope analysis, e.g. no-redeclare for top-level `const should`, and which
 *   describe() calls the mocha rules see as top-level.
 * - ESLint 9 reports unused eslint-disable comments by default.
 *
 * @param {object[]} configs the scope's flat config objects
 * @returns {object}
 */
function eslint8Defaults(configs) {
    const globalReturn = configs.some(config => !config.files &&
        config.languageOptions?.parserOptions?.ecmaFeatures?.globalReturn === true);

    return {
        languageOptions: {
            sourceType: globalReturn ? 'commonjs' : 'script'
        },
        linterOptions: {
            reportUnusedDisableDirectives: 'off'
        }
    };
}

const severity = value => (Array.isArray(value) ? value[0] : value);
const isOff = value => value === undefined || severity(value) === 'off' || severity(value) === 0;

/**
 * Restores an ESLint 8 default option for `name`: when a (non-override)
 * config enables the rule without setting `option`, inserts a config right
 * after it that sets `option`. Inserting rather than appending keeps any
 * later override that turns the rule off (e.g. typescript-eslint's for .ts).
 *
 * @param {object[]} configs flat config objects, in order
 * @param {string} name rule name
 * @param {string} option option key
 * @param {unknown} value ESLint 8 default
 * @returns {object[]}
 */
function restoreDefault(configs, name, option, value) {
    let index = -1;

    configs.forEach((config, i) => {
        if (!config.files && config.rules && name in config.rules) {
            index = i;
        }
    });

    if (index === -1) {
        return configs;
    }

    const rule = configs[index].rules[name];
    const options = (Array.isArray(rule) && rule[1]) || {};

    if (isOff(rule) || option in options) {
        return configs;
    }

    const restored = {rules: {[name]: [severity(rule), {...options, [option]: value}]}};

    return [...configs.slice(0, index + 1), restored, ...configs.slice(index + 1)];
}

/**
 * Applies a scope to a flat config object. An override's own globs must
 * match as well as the scope's: nested arrays in `files` mean "all of these".
 */
function scopeTo(flat, {files, ignores = []}) {
    const scoped = {...flat};

    scoped.files = flat.files
        ? files.flatMap(file => flat.files.map(glob => [file].concat(glob)))
        : files;

    const allIgnores = ignores.concat(flat.ignores || []);

    if (allIgnores.length) {
        scoped.ignores = allIgnores;
    } else {
        delete scoped.ignores;
    }

    return scoped;
}

/**
 * Converts an eslintrc-style config into flat config objects that only apply
 * to `files` (minus `ignores`), with ESLint 8's defaults.
 *
 * @param {object} config eslintrc-style config, e.g. the old .eslintrc.js contents
 * @param {{files: string[], ignores?: string[]}} scope
 * @returns {object[]}
 */
function eslintrc(config, scope) {
    let configs = fixupConfigRules(compat.config(config));
    const defaults = eslint8Defaults(configs);

    // ESLint 9 changed the default from 'none' to 'all'.
    configs = restoreDefault(configs, 'no-unused-vars', 'caughtErrors', 'none');

    // ESLint 8's function scope (globalReturn) kept top-level declarations out
    // of the global scope, so `const sinon = require('sinon')` never clashed
    // with the test preset's `sinon` global. In ESLint 9 commonjs scopes it does.
    if (defaults.languageOptions.sourceType === 'commonjs') {
        configs = restoreDefault(configs, 'no-redeclare', 'builtinGlobals', false);
    }

    return [defaults, ...configs].map(flat => scopeTo(flat, scope));
}

/**
 * Node.js globals for `files`, replacing `/* eslint-env node *\/` comments,
 * which flat config no longer reads.
 *
 * @param {string[]} files
 * @returns {object[]}
 */
function nodeEnv(files) {
    return compat.env({node: true}).map(flat => scopeTo(flat, {files}));
}

/**
 * Points a package's config objects at that package: every `files` and
 * `ignores` glob is made relative to the repo root. A config object without
 * `files` would apply to every package, so that's an error.
 *
 * @param {string} name package directory under packages/
 * @param {object[]} configs config objects with globs relative to the package
 * @returns {object[]}
 */
function inPackage(name, configs) {
    // FlatCompat turns eslintrc overrides into function matchers; those
    // already match on full paths, alongside the package's own globs.
    const prefix = (glob) => {
        if (typeof glob !== 'string') {
            return glob;
        }

        return glob.startsWith('!')
            ? `!packages/${name}/${glob.slice(1)}`
            : `packages/${name}/${glob}`;
    };
    const prefixAll = globs => globs.map(glob => (Array.isArray(glob) ? glob.map(prefix) : prefix(glob)));

    return configs.map((config) => {
        const keys = Object.keys(config);
        const globalIgnores = keys.length === 1 && keys[0] === 'ignores';

        if (!config.files && !globalIgnores) {
            throw new Error(`eslint.config.js: a ${name} config object has no \`files\``);
        }

        const scoped = {...config};

        if (scoped.files) {
            scoped.files = prefixAll(scoped.files);
        }

        if (scoped.ignores) {
            scoped.ignores = prefixAll(scoped.ignores);
        }

        return scoped;
    });
}

module.exports = {eslintrc, inPackage, nodeEnv};
