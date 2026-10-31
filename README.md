# Ghost SDK

A collection of tools for interacting with Ghost's APIs.

## Develop

This is a monorepo managed with [Nx](https://nx.dev) and pnpm workspaces.

1. `git clone` this repo & `cd` into it as usual
2. Install the pnpm version declared in `packageManager` using the [pnpm installation guide](https://pnpm.io/installation)
3. Run `pnpm install`
   - installs all external dependencies
   - links all internal dependencies

To add a new package to the repo:
- Create a directory under `packages/` with a package manifest and package-specific scripts.
- Nx discovers the workspace and its build, lint and test targets from that manifest.

## Run

- `pnpm dev`

## Test

- `pnpm lint` runs just ESLint
- `pnpm test` runs lint and tests


## Publish

Ghost core team only.

1. Run `pnpm ship` in the top-level SDK directory. This checks the working tree,
   runs tests, prompts for independent package versions, and pushes the version
   commit and package tags to `main`.
2. CI builds the packages and uses Nx Release to publish versions missing from
   npm using OIDC trusted publishing and provenance. Dependency install scripts
   remain disabled in the publishing job.

This follows framework's Nx release pattern. `pnpm ship` only versions, commits
and tags; publishing happens in CI. Existing npm names, independent versions and
`@tryghost/<package>@<version>` tags are preserved.

- `pnpm ship:patch`, `pnpm ship:minor`, `pnpm ship:major` apply the chosen bump to
  all packages. These commands also update dependent workspace ranges.
- To select packages, use npm package names, for example
  `pnpm ship:minor --projects=@tryghost/content-api`.
- Preview versions with `pnpm exec nx release version patch --dry-run` (add
  `--projects=<name>` to narrow the selection). This does not push or publish.
- Preview publishing with `pnpm build && pnpm exec nx release publish --dry-run`.
  This does not version or push.

Use `GHOST_UPSTREAM=upstream pnpm ship` when `origin` points to a fork and
`upstream` points to TryGhost/SDK. Ship from the upstream `main` branch. CI can
also be dispatched manually with dry-run enabled; retrying a publish skips
versions already present in the registry.

# Copyright & License

Copyright (c) 2013-2026 Ghost Foundation - Released under the [MIT license](LICENSE).
