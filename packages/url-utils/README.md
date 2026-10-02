# Url Utils

## Install

`npm install @tryghost/url-utils --save`

or

`yarn add @tryghost/url-utils`


## Usage

### Freezing URLs

When the site, subdirectory and admin URLs never change at runtime (e.g. in production), mark them as frozen so url-utils can skip calling the URL getters:

```js
const urlUtils = new UrlUtils({getSiteUrl, getSubdir, getAdminUrl, frozen: true});

// or at any time after creation
urlUtils.freeze();

// restore the original getters (e.g. after changing config in tests)
urlUtils.unfreeze();
```

While frozen, `getSiteUrl()`, `getSubdir()` and `getAdminUrl()` return the values captured at freeze time. Calling `freeze()` again re-captures the current values.


## Develop

This is a mono repository, managed with [lerna](https://lernajs.io/).

Follow the instructions for the top-level repo.
1. `git clone` this repo & `cd` into it as usual
2. Run `yarn` to install top-level dependencies.


## Run

- `yarn dev`


## Test

- `yarn lint` run just eslint
- `yarn test` run lint and tests




# Copyright & License

Copyright (c) 2013-2026 Ghost Foundation - Released under the [MIT license](LICENSE).
