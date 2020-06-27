import { expect } from 'chai'
import { configFromEnv, EnvType } from '../../src/near'

describe('config', () => {
  const accountId = 'dummy.testnet'

  context(`when invalid environment`, () => {
    const env = 'dummy' as EnvType // force incorrect type

    it('throws Error because "Unknown environment"', () => {
      const pk = 'dummy:key'
      expect(() => configFromEnv(env, accountId, pk)) //
        .throws(Error, 'Unknown environment')
    })
  })

  context(`when invalid private key`, () => {
    const env = 'development'

    it('throws Error because "Unknown curve"', () => {
      const pk = 'dummy:key'
      expect(() => configFromEnv(env, accountId, pk)) //
        .throws(Error, 'Unknown curve:')
    })

    it('throws Error because "bad secret key size"', () => {
      const pk = '12345'
      expect(() => configFromEnv(env, accountId, pk)) //
        .throws(Error, 'bad secret key size')
    })

    it('throws Error because "bad secret key size" for ed25519 curve', () => {
      const pk = 'ed25519:EsjyvmBb2ESGiyjPHMBUnTGCe1P6hPjmxxY2b2hrTBAv'
      expect(() => configFromEnv(env, accountId, pk)) //
        .throws(Error, 'bad secret key size')
    })
  })

  context(`when valid params`, () => {
    const private_key =
      'ed25519:3Zo9bWRC7vUoDHMaXdMd6osajUktbgGWxL3P89QxR8VguVPnFa7BXd5brw6tBa6RASn8YCVjPgkhpujnorCF7FR2'
    const public_key = 'ed25519:BZGHidhWFSKXUmHo2d6arxeJgthxECyFdgjW4P2GH4J4'

    const _testConfig = async (
      _env: EnvType | undefined,
      _networkId: string,
      _nodeUrl: string,
    ) => {
      const c = configFromEnv(_env, accountId, private_key)
      expect(c).not.null
      expect(c.networkId).not.null
      expect(c.networkId).to.equal(_networkId)
      expect(c.nodeUrl).not.null
      expect(c.nodeUrl).to.equal(_nodeUrl)
      expect(c.masterAccount).not.null
      expect(c.masterAccount).to.equal(accountId)
      expect(c.deps).not.null
      expect(c.deps.keyStore).not.null

      const key = await c.deps.keyStore.getKey(_networkId, accountId)
      expect(key).not.null
      expect(key.getPublicKey().toString()).to.equal(public_key)
    }

    it('configuration is successful for undefined"', async () => {
      const env = undefined
      const networkId = 'default'
      const nodeUrl = 'https://rpc.testnet.near.org'
      _testConfig(env, networkId, nodeUrl)
    })

    it('configuration is successful for development"', async () => {
      const env = 'development'
      const networkId = 'default'
      const nodeUrl = 'https://rpc.testnet.near.org'
      _testConfig(env, networkId, nodeUrl)
    })

    it('configuration is successful for testnet"', async () => {
      const env = 'testnet'
      const networkId = 'default'
      const nodeUrl = 'https://rpc.testnet.near.org'
      _testConfig(env, networkId, nodeUrl)
    })

    it('configuration is successful for production"', async () => {
      const env = 'production'
      const networkId = 'mainnet'
      const nodeUrl = 'https://rpc.mainnet.near.org'
      _testConfig(env, networkId, nodeUrl)
    })

    it('configuration is successful for mainnet"', async () => {
      const env = 'mainnet'
      const networkId = 'mainnet'
      const nodeUrl = 'https://rpc.mainnet.near.org'
      _testConfig(env, networkId, nodeUrl)
    })
  })
})
