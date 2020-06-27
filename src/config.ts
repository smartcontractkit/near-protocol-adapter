import { configFrom, configFromEnv, AccountConfig, EnvType } from './near'

export const ENV_PORT = 'EA_PORT'
export const ENV_NODE_ENV = 'NODE_ENV'
export const ENV_NETWORK_ID = 'NETWORK_ID'
export const ENV_NODE_URL = 'NODE_URL'
export const ENV_ACCOUNT_ID = 'ACCOUNT_ID'
export const ENV_PRIVATE_KEY = 'PRIVATE_KEY'

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
