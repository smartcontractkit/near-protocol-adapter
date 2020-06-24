# NEAR Protocol Write Adapter

This service is used by a Chainlink node as an external adapter for writing to [NEAR Blockchain](https://near.org/).

The external adapter allows you to configure an endpoint, account and private key to sign and send transactions.

## Prerequisite

- Yarn v1.22+: You will need to have [Yarn v1.22+ installed](https://yarnpkg.com/getting-started/install) locally.
  - This repo also activates the Berry release (codename for the Yarn 2). To switch between versions use the `yarnPath` release path in [.yarnrc.yml](.yarnrc.yml) file, and run `yarn install` because of differences in `yarn.lock` file.
- Node v12+: [n](https://github.com/tj/n) is a great interactive manager for your Node.js versions.

## Install

If using Yarn v1.22+ (default), or when switching between versions (from v1.22+ -> v2, and back), please run:

```bash
yarn install
```

## Set up NEAR accout

### Prerequisite

- NEAR account: Please create one with [NEAR Wallet](https://wallet.nearprotocol.com).
- NEAR Shell: Please install it following the [NEAR docs instructions](https://docs.near.org/docs/development/near-shell).

### NEAR login

In the project root, login with `near-shell` by following the instructions after this command:

```bash
near login
```

This step is required to get to the NEAR account private key which can be found at `~/.near-credentials/default/${ACCOUNT_ID}.json`:

```
{"account_id":"${ACCOUNT_ID}","private_key":"ed25519:..."}
```

## Start

Supported environment variables:

- PORT: optional, defaults to `3000`
- NODE_ENV: optional, defaults to `development`
- ACCOUNT_ID: required
- PRIVATE_KEY: required

Set the required environment, and run from the project root:

```bash
yarn start
```

Alternatively you can set the environment inline:

```bash
env \
  ACCOUNT_ID=dummy.testnet \
  PRIVATE_KEY=ed25519:3Zo9bWRC7vUoDHMaXdMd6osajUktbgGWxL3P89QxR8VguVPnFa7BXd5brw6tBa6RASn8YCVjPgkhpujnorCF7FR2 \
  NODE_ENV=testnet \
yarn start
```

## Test

### Unit tests

Run from the project root:

```bash
yarn test
```

