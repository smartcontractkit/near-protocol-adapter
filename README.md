# NEAR Protocol Write Adapter

This service is used by a Chainlink node as an external adapter for writing to [NEAR Blockchain](https://near.org/).

The external adapter allows you to configure an endpoint, account and private key to sign and send transactions.

## Dependencies

- Yarn 2: This repo activates the Berry release (codename for the Yarn 2). You will need to have [Yarn v1.22+ installed](https://yarnpkg.com/getting-started/install) locally.
- Node v12+: [n](https://github.com/tj/n) is a great interactive manager for your Node.js versions.

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

From the project root run:

```bash
yarn test
```
