# NEAR Protocol Write Adapter

This service is used by a Chainlink node as an external adapter for writing to [NEAR Blockchain](https://near.org/).

The external adapter allows you to configure an endpoint, account and private key to sign and send transactions.

## Prerequisite

- Yarn v1.22+: You will need to have [Yarn v1.22+ installed](https://yarnpkg.com/getting-started/install) locally.
  - This repo also activates the Berry release (codename for the Yarn 2), disabled by default.
  - To switch between versions use the `yarnPath` release path in [.yarnrc.yml](.yarnrc.yml) file, and run `yarn install` because of differences in `yarn.lock` file.
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

```json
{ "account_id": "${ACCOUNT_ID}", "private_key": "ed25519:..." }
```

## Start

Supported environment variables:

- ACCOUNT_ID: NEAR account that this service will use
- PRIVATE_KEY: NEAR account private key
- PORT: (optional) defaults to `3000`
- NODE_ENV: (optional) one of `[production|mainnet|development|testnet|devnet|betanet|local]`, defaults to `development`
- NETWORK_ID: (optional) custom network id, `NODE_URL` must also be set
- NODE_URL: (optional) custom node url, `NETWORK_ID` must also be set

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

Or for a custom connection:

```bash
env \
  ACCOUNT_ID=dummy.acmenet \
  PRIVATE_KEY=ed25519:3Zo9bWRC7vUoDHMaXdMd6osajUktbgGWxL3P89QxR8VguVPnFa7BXd5brw6tBa6RASn8YCVjPgkhpujnorCF7FR2 \
  NETWORK_ID=acmenet \
  NODE_URL=https://rpc.acmenet.acme.org \
yarn start
```

This service can be started as a standalone service or as a [Chainlink node adapter](#chainlink-node-integration).

## API

The standalone service exposes all endpoints discussed next, while the service started as a [Chainlink node adapter](#chainlink-node-integration) exposes just one endpoint `POST /call`, but it's mapped as root endpoint `POST /`.

### HTTP `GET /` endpoint

Read NEAR network connection status.

Output:

```json
{
  "chain_id": "testnet",
  "latest_protocol_version": 22,
  "protocol_version": 22,
  "rpc_addr": "0.0.0.0:3030",
  "sync_info": {
    "latest_block_hash": "7nWiri3qx9G2h2qG2KCX9N2ChDPDgWjgzo5V31HTMxxf",
    "latest_block_height": 7626572,
    "latest_block_time": "2020-06-25T10:36:40.696884241Z",
    "latest_state_root": "FMwXSxgkgvtxdMZaHMrsLsZVKcxDJi2mBk9nbrz4CxWN",
    "syncing": false
  },
  "validators": [
    {
      "account_id": "bisontrails.stakingpool",
      "is_slashed": false
    },
    ... // more validators
  ],
  "version": {
    "build": "ebe21b33",
    "version": "1.0.0"
  }
}
```

### HTTP `GET /account` endpoint

Read configured NEAR account.

Output:

```json
{
  "accessKey": "ed25519:6J9NoFmr4mzBLch3tzKDfetY4YVNGQG74urLHeUDfCcw",
  "accountId": "krebernisak_1.testnet"
}
```

### HTTP `GET /view` endpoint

Read contract state from NEAR network.

Input:

- `contractId`: account where the contract is deployed
- `methodName`: function name to call on the contract
- `args`: (optional) function arguments

```json
{ "contractId": "counter.testnet", "methodName": "getCounter" }
```

Output:

```json
{
  "data": ..., // View function output data
  "statusCode": 200
}
```

### HTTP `POST /call` endpoint

**Available as `POST /` when started as Chainlink node adapter**

Send transaction and write state to the NEAR network.

Input:

- `contractId`: account where the contract is deployed
- `methodName`: function name to call on the contract
- `args`: (optional) function arguments
- `gas`: (optional) gas amount allocated for transaction execution
- `amount`: (optional) amount of NEAR sent with the transaction

```json
{
  "contractId": "counter.testnet",
  "methodName": "decrementCounter",
  "args": { "value": 13 },
  "gas": 5000000000000,
  "amount": 50
}
```

Output:

```json
{
  "data": {
    ... // Transaction result data
  },
  "statusCode": 200
}
```

### Errors

API will return a `HTTP 400` for client errors:

```json
{
  "message": "Missing required fields: contractId or methodName",
  "status": "BadRequest",
  "statusCode": 400,
  "type": "UntypedError"
}
```

Or `HTTP 500` for server errors:

```json
{
  "message": "Exceeded the prepaid gas",
  "status": "Error",
  "statusCode": 500,
  "type": "GasExceeded"
}
```

## Test

### Unit tests

Run from the project root:

```bash
yarn test
```

### Integration tests

#### Step 1: Deploy contract to NEAR network

For this test we are going to use [NEAR counter example](https://github.com/near-examples/counter) deployed to `@counter.testnet`.

Please follow their instructions to:

- Set up a new NEAR account where the contract will be deployed
- Login to NEAR Shell with your new account
- Deploy the contract

#### Step 2: Interact with contracts

To interact with the contracts, we are going to use [HTTPie](https://httpie.org/), a user-friendly command-line HTTP client, as an alternative to CURL.

Make sure the counter contract is deployed and the adapter service is started.

##### Read contract state

Use the `/view` endpoint to read contract state:

```bash
echo '{"contractId": "counter.testnet", "methodName": "getCounter"}' | http GET :3000/view
```

Example output:

```json
{
  "data": 0,
  "statusCode": 200
}
```

##### Write contract state

Use the `/call` endpoint to write contract state:

```bash
echo '{"contractId": "counter.testnet", "methodName": "incrementCounter", "args": {"value": 4}}' | http POST :3000/call
```

The `/call` endpoint also lets you control the `gas` and `amount` sent to the contract:

```bash
echo '{"contractId": "counter.testnet", "methodName": "decrementCounter", "args": {"value": 13}, "gas": 5000000000000, "amount": 50}' | http POST :3000/call
```

Example output:

```json
{
  "data": {
    "receipts_outcome": [
      {
        "block_hash": "9fdLpAdoPKoxwETaycVvwT5Lm2zy28fLGPKj2f4pkAVP",
        "id": "DeJ1GKwsRTfW63DBJBnAZPC4T8mnVgkkpvconBtfsWzM",
        "outcome": {
          "gas_burnt": 2757914274712,
          "logs": ["Counter is now: -9"],
          "receipt_ids": ["FeGwwskgZ95NQ6Pg9z745uq8sRJyyw83xYEXfJP4qoCe"],
          "status": {
            "SuccessValue": ""
          }
        },
        "proof": []
      },
      {
        "block_hash": "HEs6d5HkTCojADaw2DHJgXMEBGNkn3GuLfNDVjWqV3Qx",
        "id": "FeGwwskgZ95NQ6Pg9z745uq8sRJyyw83xYEXfJP4qoCe",
        "outcome": {
          "gas_burnt": 0,
          "logs": [],
          "receipt_ids": [],
          "status": {
            "SuccessValue": ""
          }
        },
        "proof": []
      }
    ],
    "status": {
      "SuccessValue": ""
    },
    "transaction": {
      "actions": [
        {
          "FunctionCall": {
            "args": "eyJ2YWx1ZSI6MTN9",
            "deposit": "50",
            "gas": 5000000000000,
            "method_name": "decrementCounter"
          }
        }
      ],
      "hash": "EGMf4L6YvinLpjeCbfVVVXEPcfRMZ2HrvcHbDfiNiRMN",
      "nonce": 37,
      "public_key": "ed25519:6J9NoFmr4mzBLch3tzKDfetY4YVNGQG74urLHeUDfCcw",
      "receiver_id": "counter.testnet",
      "signature": "ed25519:21zN5PZKVueb79oUwKMkhshrwqw7uGzh7vgGCqkr8K1CF5XL6G6NtciYyU4xochHFXm4WY3pcHACPfnKUXSh7EvU",
      "signer_id": "krebernisak_1.testnet"
    },
    "transaction_outcome": {
      "block_hash": "GDZGu1P2Ff983WgiVuDkMVULZs5ED85L99TJaQE62pyL",
      "id": "EGMf4L6YvinLpjeCbfVVVXEPcfRMZ2HrvcHbDfiNiRMN",
      "outcome": {
        "gas_burnt": 2427983606152,
        "logs": [],
        "receipt_ids": ["DeJ1GKwsRTfW63DBJBnAZPC4T8mnVgkkpvconBtfsWzM"],
        "status": {
          "SuccessReceiptId": "DeJ1GKwsRTfW63DBJBnAZPC4T8mnVgkkpvconBtfsWzM"
        }
      },
      "proof": []
    }
  },
  "statusCode": 200
}
```

## Chainlink node integration

The Chainlink node expects a specific adapter API - we only expose the call function (send tx) on `/` endpoint.

Chainlink adapter requires and supports additional environment variables:

- CONTRACT_ID: NEAR account where the contract is deployed
- METHOD_NAME: Method name that will be called by the adapter
- GAS: (optional) Gas sent with the transaction, defaults to `300000000000000`
- AMOUNT: (optional) Amount sent with the transaction, defaults to `0`

To start the service as Chainlink node adapter:

```bash
env \
 NODE_ENV=testnet \
 PORT=3000 \
 ACCOUNT_ID=dummy.testnet \
 PRIVATE_KEY=ed25519:3Zo9bWRC7vUoDHMaXdMd6osajUktbgGWxL3P89QxR8VguVPnFa7BXd5brw6tBa6RASn8YCVjPgkhpujnorCF7FR2 \
 CONTRACT_ID=oracle.oracle.testnet \
 METHOD_NAME=fulfill_request \
yarn start:adapter
```

To deploy, build the Docker image:

```bash
docker build -t near-protocol-adapter .
```

Run the Docker container:

```bash
docker run -d \
    --name near-protocol-adapter \
    -p 3000:3000 \
    -e NODE_ENV=testnet \
    -e PORT=3000 \
    -e ACCOUNT_ID=dummy.testnet \
    -e PRIVATE_KEY=ed25519:3Zo9bWRC7vUoDHMaXdMd6osajUktbgGWxL3P89QxR8VguVPnFa7BXd5brw6tBa6RASn8YCVjPgkhpujnorCF7FR2 \
    -e CONTRACT_ID=oracle.oracle.testnet \
    -e METHOD_NAME=fulfill_request \
    near-protocol-adapter
```

In this configuration the `/` endpoint expects a slightly different input, we need to include the job spec id:

```json
{
  "id": 1, // job spec id
  "data": {...} // input to our call function (as before)
}
```

For example, incrementing a [counter](https://github.com/near-examples/counter):

```json
echo '{"id": 1, "data": {"contractId": "counter.testnet", "methodName": "incrementCounter", "args": {"value": 1}, "gas": 5000000000000, "amount": 50}}' | http POST :3000/
```

Output:

```json
{
  "data": {
    "result": "6yTpkCW3UqVtpGj766Wvr73zEambzL2n44CDYiB4TpVP" // tx hash
  },
  "jobRunID": 1,
  "result": "6yTpkCW3UqVtpGj766Wvr73zEambzL2n44CDYiB4TpVP", // tx hash
  "statusCode": 200
}
```
