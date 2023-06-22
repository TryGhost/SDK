# Ghost SDK: Empower Your Development with Ghost's APIs

Welcome to the Ghost SDK, a comprehensive collection of powerful tools for interacting with Ghost's APIs.

This is a well-organized mono repository, managed with [lerna](https://lerna.js.org/) designed to streamline your development process.

## Get Started
1. Clone the Ghost SDK repository to your local machine using `git clone https://github.com/tryghost/sdk.git` and navigate to the cloned repository.
1. With a single command, `yarn setup`, powered by lerna bootstrap, you can install all external dependencies and seamlessly link internal dependencies.

To add a new package to this repository 
* Install [slimer](https://github.com/TryGhost/slimer)
* Run `slimer new <package name>`

## Run
* Execute `yarn dev` to launch your project.
* Verify your code quality with `yarn lint` for ESLint checks and `yarn test` for linting and running tests.

## Publish
* Utilize `yarn shipv, an alias for lerna publish, to publish only the changed packages.
* Additionally, any packages dependent on the changed packages will be updated automatically.

NOTE: Use `yarn ship --git-remote upstream` for correct tag and version commit updates when your remote `origin` is set up as a fork of TryGhost/SDK, and the original repository is set to `upstream`. 

## Copyright & License
Copyright (c) 2013-2023 Ghost Foundation - Released under the [MIT license](LICENSE).
