# Ghost SDK

A collection of tools for interacting with Ghost's APIs.

## Develop

This is a monorepo managed with [Lerna](https://lerna.js.org/) and pnpm workspaces.

1. `git clone` this repo & `cd` into it as usual
2. Enable Corepack with `corepack enable`
3. Run `pnpm setup`
   - installs all external dependencies
   - links all internal dependencies

To add a new package to the repo:
- run `npx lerna create <package name>`

## Run

- `pnpm dev`

## Test

- `pnpm lint` runs just ESLint
- `pnpm test` runs lint and tests


## Publish

Ghost core team only.

1. Run `pnpm ship` in the top-level SDK directory — this runs tests, prompts for version bumps, and pushes the version commit to `main`
2. CI automatically publishes the updated packages to npm via the `publish.yml` workflow

NOTE: use `GHOST_UPSTREAM=upstream pnpm ship` to correctly update tags and version commits when your remote `origin` is set up to a fork of TryGhost/SDK and the original repository is set to `upstream`.

# Copyright & License

Copyright (c) 2013-2026 Ghost Foundation - Released under the [MIT license](LICENSE).
