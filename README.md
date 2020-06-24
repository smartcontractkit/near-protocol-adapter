# NEAR Protocol Write Adapter

This service is used by a Chainlink node as an external adapter for writing to [NEAR Blockchain](https://near.org/).

## Dependencies

- Yarn v1.22+: You will need to have [Yarn v1.22+ installed](https://yarnpkg.com/getting-started/install) locally.
  - This repo also activates the Berry release (codename for the Yarn 2). To switch between versions use the `yarnPath` release path in [.yarnrc.yml](.yarnrc.yml) file, and run `yarn install` because of differences in `yarn.lock` file.
- Node v12+: [n](https://github.com/tj/n) is a great interactive manager for your Node.js versions.

## Install

If using Yarn v1.22+ (default), or when switching between versions (from v1.22+ -> v2, and back), please run:

```bash
yarn install
```

