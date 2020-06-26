import { configFrom, configFromEnv, NearAccountConfig } from './near/config'

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
 * Get variable from environment
 * @param name The name of environment variable
 * @throws {RequiredEnvError} Will throw an error if environment variable is not defined.
 * @returns {string}
 */
export const getRequiredEnv = (name: string): string => {
  if (!process.env[name]) throw new RequiredEnvError(name)
  return process.env[name] || ''
}

export const connectionConfig = (): NearAccountConfig => {
  const { env } = process
  const accountId = getRequiredEnv(ENV_ACCOUNT_ID)
  const pk = getRequiredEnv(ENV_PRIVATE_KEY)
  if (env[ENV_NETWORK_ID] && env[ENV_NODE_URL]) {
    const connectConfig = {
      networkId: env[ENV_NETWORK_ID] as string,
      nodeUrl: env[ENV_NODE_URL] as string,
    }
    return configFrom(connectConfig, accountId, pk)
  }
  return configFromEnv(process.env[ENV_NODE_ENV], accountId, pk)
}
