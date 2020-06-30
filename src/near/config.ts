import { keyStores, KeyPair } from 'near-api-js'
import { SingleKeyStore } from './single_key_store'

const DEFAULT_ENV_NODE_ENV = 'development'

type KeyStore = keyStores.KeyStore
type NearConfig = {
  keyStore?: KeyStore
  deps?: { keyStore: KeyStore }
  helperUrl?: string
  masterAccount?: string
  walletUrl?: string
  networkId: string
  nodeUrl: string
}
export type ConnectConfig = NearConfig & {
  keyPath?: string
}
export type AccountConfig = NearConfig & {
  keyStore: KeyStore
  deps: { keyStore: KeyStore }
  masterAccount: string
  masterAccessKey: string
}

export type EnvType =
  | 'production'
  | 'mainnet'
  | 'development'
  | 'testnet'
  | 'devnet'
  | 'betanet'
  | 'local'

function getConfig(env: EnvType): ConnectConfig {
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

/* eslint-disable @typescript-eslint/no-unused-vars */
const cloneNoSecrets = (config: NearConfig): NearConfig =>
  (({ keyStore, deps, ...o }) => o)(config)

export const logConfig = (config: AccountConfig): void => {
  console.log('NEAR Protocol connection configuration:')
  console.log(cloneNoSecrets(config))
}

export const configFromEnv = (
  env: EnvType | undefined,
  accountId: string,
  pk: string,
): AccountConfig => {
  const config = getConfig(env || DEFAULT_ENV_NODE_ENV)
  return configFrom(config, accountId, pk)
}

export const configFrom = (
  connectConfig: ConnectConfig,
  accountId: string,
  pk: string,
): AccountConfig => {
  const keyPair = KeyPair.fromString(pk)
  const { networkId } = connectConfig
  const keyStore = new SingleKeyStore(networkId, accountId, keyPair)

  return {
    ...connectConfig,
    keyStore,
    deps: { keyStore },
    masterAccount: accountId,
    masterAccessKey: keyPair.getPublicKey().toString(),
  }
}
