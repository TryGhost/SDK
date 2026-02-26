# Ghost SDK

A collection of tools for interacting with Ghost's APIs.

## Develop

This is a mono repository, managed with [lerna](https://lerna.js.org/).

1. `git clone` this repo & `cd` into it as usual
2. `yarn setup` is mapped to `lerna bootstrap`
   - installs all external dependencies
   - links all internal dependencies

To add a new package to the repo:
   - install [slimer](https://github.com/TryGhost/slimer)
   - run `slimer new <package name>`

## Run

- `yarn dev`

## Test

- `yarn lint` run just eslint
- `yarn test` run lint and tests


## Publish

Ghost core team only.

1. Run `yarn ship` in the top-level SDK directory — this runs tests, prompts for version bumps, and pushes the version commit to `main`
2. CI automatically publishes the updated packages to npm via the `publish.yml` workflow

NOTE: use `yarn ship --git-remote upstream` to correctly update tags and version commits, when your remote `origin` is set up to a fork of TryGhost/SDK and original repository is set to `upstream`.

# Copyright & License

Copyright (c) 2013-2026 Ghost Foundation - Released under the [MIT license](LICENSE).
