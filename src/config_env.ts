export const ENV_PORT = 'PORT'
export const ENV_NODE_ENV = 'NODE_ENV'
export const ENV_ACCOUNT_ID = 'ACCOUNT_ID'
export const ENV_PRIVATE_KEY = 'PRIVATE_KEY'

/**
 * Custom error for required env variable.
 */
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
