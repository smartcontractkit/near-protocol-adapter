import { KeyPair } from 'near-api-js'
import { SingleKeyStore } from './single_key_store'

const DEFAULT_ENV_NODE_ENV = 'development'

function getConfig(env: string) {
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
      }
    case 'development':
    case 'testnet':
      return {
        networkId: 'default',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
      }
    case 'devnet':
      return {
        networkId: 'devnet',
        nodeUrl: 'https://rpc.devnet.near.org',
        walletUrl: 'https://wallet.devnet.near.org',
        helperUrl: 'https://helper.devnet.near.org',
      }
    case 'betanet':
      return {
        networkId: 'betanet',
        nodeUrl: 'https://rpc.betanet.near.org',
        walletUrl: 'https://wallet.betanet.near.org',
        helperUrl: 'https://helper.betanet.near.org',
      }
    case 'local':
      return {
        networkId: 'local',
        nodeUrl: 'http://localhost:3030',
        keyPath: `${process.env.HOME}/.near/validator_key.json`,
        walletUrl: 'http://localhost:4000/wallet',
      }
    default:
      throw Error(
        `Unknown environment '${env}'. Can be configured in src/config.js.`,
      )
  }
}

export default (
  env: string | undefined,
  accountId: string,
  pk: string,
): any => {
  const config = getConfig(env || DEFAULT_ENV_NODE_ENV)
  const keyPair = KeyPair.fromString(pk)
  const keyStore = new SingleKeyStore(config.networkId, accountId, keyPair)

  return {
    ...config,
    deps: { keyStore },
    masterAccount: accountId,
  }
}
