import { expect } from 'chai'

import {
  ENV_ACCOUNT_ID,
  ENV_PRIVATE_KEY,
  RequiredEnvError,
  connectionConfig,
  getRequiredEnv,
} from '../src/config'

describe('incorrect app config', () => {
  beforeEach(() => {
    delete process.env[ENV_ACCOUNT_ID]
    delete process.env[ENV_PRIVATE_KEY]
  })

  context('when no env is set', () => {
    it(`throws RequiredEnvError for ${ENV_ACCOUNT_ID}`, () => {
      expect(() => getRequiredEnv(ENV_ACCOUNT_ID)) //
        .throws(RequiredEnvError, ENV_ACCOUNT_ID)
    })
  })

  context(`when ${ENV_ACCOUNT_ID} is set but not ${ENV_PRIVATE_KEY}`, () => {
    beforeEach(() => {
      process.env[ENV_ACCOUNT_ID] = 'dummy.testnet'
    })

    it(`throws RequiredEnvError for ${ENV_PRIVATE_KEY}`, () => {
      expect(() => connectionConfig()) //
        .throws(RequiredEnvError, ENV_PRIVATE_KEY)
    })
  })

  context(
    `when ${ENV_ACCOUNT_ID} is set but invalid ${ENV_PRIVATE_KEY}`,
    () => {
      beforeEach(() => {
        process.env[ENV_ACCOUNT_ID] = 'dummy.testnet'
      })

      it('throws Error because "Unknown curve"', () => {
        process.env[ENV_PRIVATE_KEY] = 'dummy:key'
        expect(() => connectionConfig()) //
          .throws(Error, 'Unknown curve:')
      })

      it('throws Error because "bad secret key size"', () => {
        process.env[ENV_PRIVATE_KEY] = '12345'
        expect(() => connectionConfig()) //
          .throws(Error, 'bad secret key size')
      })

      it('throws Error because "bad secret key size" for ed25519 curve', () => {
        process.env[ENV_PRIVATE_KEY] =
          'ed25519:EsjyvmBb2ESGiyjPHMBUnTGCe1P6hPjmxxY2b2hrTBAv'
        expect(() => connectionConfig()) //
          .throws(Error, 'bad secret key size')
      })
    },
  )
})
