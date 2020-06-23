import { keyStores, KeyPair } from 'near-api-js'

const { KeyStore } = keyStores

/**
 * Custom error for not supported functionality.
 */
class NotSupportedError extends Error {
  constructor(fnName: string) {
    super(`${fnName}() function is not supported for ${SingleKeyStore.name}.`)
    this.name = NotSupportedError.name
  }
}

/**
 * Simple in-memory keystore that holds a single key.
 */
export class SingleKeyStore extends KeyStore {
  private keys: { [key: string]: string }

  constructor(networkId: string, accountId: string, keyPair: KeyPair) {
    super()
    this.keys = {
      [`${accountId}:${networkId}`]: keyPair.toString(),
    }
  }

  /**
   * Not supported
   */
  async setKey(): Promise<void> {
    throw new NotSupportedError(this.setKey.name)
  }

  /**
   * Gets a key from in-memory storage
   * @param networkId The targeted network. (ex. default, devnet, betanet, etc…)
   * @param accountId The NEAR account tied to the key pair
   * @returns {Promise<KeyPair>}
   */
  async getKey(networkId: string, accountId: string): Promise<KeyPair> {
    const value = this.keys[`${accountId}:${networkId}`]
    if (!value) {
      return null as any
    }
    return KeyPair.fromString(value)
  }

  /**
   * Not supported
   */
  async removeKey(): Promise<void> {
    throw new NotSupportedError(this.removeKey.name)
  }

  /**
   * Not supported
   */
  async clear(): Promise<void> {
    throw new NotSupportedError(this.clear.name)
  }

  /**
   * Get the network(s) from in-memory storage
   * @returns {Promise<string[]>}
   */
  async getNetworks(): Promise<string[]> {
    const result = new Set<string>()
    Object.keys(this.keys).forEach((key) => {
      const parts = key.split(':')
      result.add(parts[1])
    })
    return Array.from(result.values())
  }

  /**
   * Gets the account(s) from in-memory storage
   * @param networkId The targeted network. (ex. default, devnet, betanet, etc…)
   * @returns{Promise<string[]>}
   */
  async getAccounts(networkId: string): Promise<string[]> {
    const result = new Array<string>()
    Object.keys(this.keys).forEach((key) => {
      const parts = key.split(':')
      if (parts[parts.length - 1] === networkId) {
        result.push(parts.slice(0, parts.length - 1).join(':'))
      }
    })
    return result
  }
}
