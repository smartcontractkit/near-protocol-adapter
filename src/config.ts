import BN from 'bn.js'
import { configFrom, configFromEnv, AccountConfig, EnvType } from './near'

export const ENV_NODE_ENV = 'NODE_ENV'

// NEAR connection config
export const ENV_PORT = 'PORT'
export const ENV_NETWORK_ID = 'NETWORK_ID'
export const ENV_NODE_URL = 'NODE_URL'
export const ENV_ACCOUNT_ID = 'ACCOUNT_ID'
export const ENV_PRIVATE_KEY = 'PRIVATE_KEY'

// Chainlink adapter config
export const ENV_CONTRACT_ID = 'CONTRACT_ID'
export const ENV_METHOD_NAME = 'METHOD_NAME'
export const ENV_GAS = 'GAS'
export const ENV_AMOUNT = 'AMOUNT'

// Chainlink adapter config defaults
export const DEFAULT_ENV_GAS = new BN('300000000000000')
export const DEFAULT_ENV_AMOUNT = new BN('0')

// Custom error for required env variable.
export class RequiredEnvError extends Error {
  constructor(name: string) {
    super(`Please set the required env ${name}.`)
    this.name = RequiredEnvError.name
  }
}

/**
 * Get variable from environments
 * @param name The name of environment variable
 * @throws {RequiredEnvError} Will throw an error if environment variable is not defined.
 * @returns {string}
 */
export const getRequiredEnv = (name: string): string => {
  const val = process.env[name]
  if (!val) throw new RequiredEnvError(name)
  return val
}

// Build  NEAR config form environment
export const connectionConfig = (): AccountConfig => {
  const accountId = getRequiredEnv(ENV_ACCOUNT_ID)
  const pk = getRequiredEnv(ENV_PRIVATE_KEY)

  const networkId = process.env[ENV_NETWORK_ID]
  const nodeUrl = process.env[ENV_NODE_URL]
  if (networkId && nodeUrl) {
    const connectConfig = { networkId, nodeUrl }
    return configFrom(connectConfig, accountId, pk)
  }

  const envType = (process.env[ENV_NODE_ENV] as EnvType) || undefined
  return configFromEnv(envType, accountId, pk)
}
