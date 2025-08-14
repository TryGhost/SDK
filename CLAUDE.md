# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

The Ghost SDK is a monorepo containing a collection of JavaScript/TypeScript packages for interacting with Ghost's APIs. It uses Lerna for monorepo management and Yarn workspaces.

## Common Development Commands

### Setup & Installation
- **Initial setup**: `yarn setup` (mapped to `lerna bootstrap`)
  - Installs all external dependencies
  - Links all internal dependencies
- **Install dependencies**: `yarn`

### Testing
- **Run all tests**: `yarn test` (runs `lerna run test`)
  - This runs tests in all packages
- **Run tests in specific package**: `cd packages/<package-name> && yarn test`
- **Run tests with coverage**: Most packages use `NODE_ENV=testing c8 --all --reporter text --reporter cobertura mocha './test/**/*.test.js'`
- **Run specific test file**: `NODE_ENV=testing mocha './test/specific.test.js'`
- **Run tests matching pattern**: `NODE_ENV=testing mocha './test/**/*.test.js' --grep "pattern"`

### Linting
- **Run all linters**: `yarn lint` (runs `lerna run lint`)
- **Run linter in specific package**: `cd packages/<package-name> && yarn lint`
- **Fix linting issues**: `yarn lint -- --fix`

### Building
- **Build packages with build scripts**: Individual packages have their own build commands
  - For packages with Rollup: `yarn build`
  - TypeScript packages: Check for `tsconfig.json` and build scripts

### Publishing
- **Publish packages**: `yarn ship` (alias for `lerna publish`)
  - Publishes all packages which have changed
  - Updates any packages which depend on changed packages
  - Use `yarn ship --git-remote upstream` when `origin` points to a fork and `upstream` points to the original TryGhost/SDK repo

## Package Structure

All packages are located in the `/packages` directory:

### API Packages
- **@tryghost/admin-api**: Admin API client for Ghost
- **@tryghost/content-api**: Content API client for Ghost
- **@tryghost/admin-api-schema**: JSON schemas for Admin API

### Utility Packages
- **@tryghost/helpers**: Template helpers (reading time, tags, etc.)
- **@tryghost/helpers-gatsby**: Gatsby-specific helpers
- **@tryghost/url-utils**: URL manipulation utilities
- **@tryghost/string**: String manipulation (slugify, escapeHtml, etc.)
- **@tryghost/color-utils**: Color manipulation utilities
- **@tryghost/config-url-helpers**: URL configuration helpers
- **@tryghost/social-urls**: Social media URL generation
- **@tryghost/schema-org**: Schema.org structured data generation
- **@tryghost/timezone-data**: Timezone data utilities

### Content Processing
- **@tryghost/html-to-plaintext**: HTML to plaintext conversion
- **@tryghost/html-to-mobiledoc**: HTML to Mobiledoc conversion
- **@tryghost/image-transform**: Image transformation utilities

### Infrastructure
- **@tryghost/limit-service**: Centralized limit enforcement
- **@tryghost/adapter-base-cache**: Base cache adapter
- **@tryghost/members-csv**: CSV parsing for members import/export
- **@tryghost/referrer-parser**: Referrer parsing utilities

### Frontend Packages
- **@tryghost/custom-fonts**: Custom font utilities

## Testing Approach

- Testing framework: **Mocha** with **Should.js** for assertions
- Mocking: **Sinon** for stubs and mocks
- Coverage: **c8** for code coverage
- Environment: Set `NODE_ENV=testing` when running tests

### Test Structure
```
packages/<package-name>/
├── test/
│   ├── unit/          # Unit tests (if separated)
│   ├── integration/   # Integration tests (if separated)
│   ├── fixtures/      # Test fixtures and mock data
│   └── utils/         # Test utilities
│       ├── assertions.js
│       ├── index.js
│       └── overrides.js
```

## Adding New Packages

To add a new package to the repo:
1. Install [slimer](https://github.com/TryGhost/slimer)
2. Run `slimer new <package name>`

## Build Systems

Different packages use different build systems:

### Rollup-based packages
- **content-api**, **timezone-data**, **helpers**, **color-utils**
- Build command: `yarn build`
- Configuration: `rollup.config.js`
- Outputs: `cjs/`, `es/`, `umd/` directories

### TypeScript packages
- **color-utils**, **timezone-data**, **custom-fonts**, **referrer-parser**
- Configuration: `tsconfig.json`
- Some use Vite for building

### Plain JavaScript packages
- Most other packages don't require building
- Source in `lib/` directory

## Important Notes

- This is a Yarn workspaces monorepo - always use `yarn`, not `npm`
- The main branch is `master` (not `main`) for pull requests
- All packages are published under the `@tryghost` scope
- Packages have independent versioning
- ESLint configuration uses `eslint-plugin-ghost`
- Most packages follow similar patterns for structure and testing

## Environment Variables

- `NODE_ENV=testing` - Required for running tests
- `GHOST_UPSTREAM` - Set remote for publishing (defaults to `origin`)

## Git Configuration

- Default branch for PRs: `main`
- Publishing allowed from: `main` branch
- Commit message for version updates: "Published new versions"

## Common Patterns

### Error Handling
- Most packages use `@tryghost/errors` for consistent error formatting

### Database Integration
- Packages expecting database access use Knex instances
- Support for transactions via `options.transacting`

### API Versioning
- API packages support multiple versions (v2, v3, v4, v5, v6, canary)
- Version-specific tests in `test/<package>-test/v*.test.js`

## Development Tips

1. Run tests before committing
2. Use `yarn lint` to check code style
3. Follow existing patterns in the codebase
4. Add tests for new functionality
5. Update README.md in package directory for significant changes
6. Use semantic versioning for package updates
