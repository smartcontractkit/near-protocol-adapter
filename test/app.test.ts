import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)

const { expect } = chai

import {
  ENV_ACCOUNT_ID,
  ENV_PRIVATE_KEY,
  RequiredEnvError,
} from '../src/config_env'

describe('incorrect app config', () => {
  context('when no env is set', () => {
    it(`throws RequiredEnvError for ${ENV_ACCOUNT_ID}`, () => {
      return expect(import('../src/app')).to.be.rejectedWith(
        RequiredEnvError,
        ENV_ACCOUNT_ID,
      )
    })
  })

  context(`when ${ENV_ACCOUNT_ID} is set but not ${ENV_PRIVATE_KEY}`, () => {
    beforeEach(() => {
      process.env[ENV_ACCOUNT_ID] = 'dummy.testnet'
    })
    it(`throws RequiredEnvError for ${ENV_PRIVATE_KEY}`, () => {
      return expect(import('../src/app')).to.be.rejectedWith(
        RequiredEnvError,
        ENV_PRIVATE_KEY,
      )
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
        return expect(import('../src/app')).to.be.rejectedWith(
          Error,
          'Unknown curve:',
        )
      })
      it('throws Error because "bad secret key size"', () => {
        process.env[ENV_PRIVATE_KEY] = '12345'
        return expect(import('../src/app')).to.be.rejectedWith(
          Error,
          'bad secret key size',
        )
      })
      it('throws Error because "bad secret key size" for ed25519 curve', () => {
        process.env[ENV_PRIVATE_KEY] =
          'ed25519:EsjyvmBb2ESGiyjPHMBUnTGCe1P6hPjmxxY2b2hrTBAv'
        return expect(import('../src/app')).to.be.rejectedWith(
          Error,
          'bad secret key size',
        )
      })
    },
  )
})
