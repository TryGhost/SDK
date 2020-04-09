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

- `yarn ship` is an alias for `lerna publish`
    - Publishes all packages which have changed
    - Also updates any packages which depend on changed packages

NOTE: use `yarn ship --git-remote upstream` to correctly update tags and version commits, when your remote `origin` is set up to a fork of TryGhost/Ghost-SDK and original repository is set to `upstream`.

# Copyright & License

Copyright (c) 2018-2020 Ghost Foundation - Released under the [MIT license](LICENSE).
