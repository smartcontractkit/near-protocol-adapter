import chai from 'chai'
import chaiHttp = require('chai-http')

chai.use(chaiHttp)

const { expect, request } = chai

import { ENV_ACCOUNT_ID, ENV_PRIVATE_KEY } from '../src/config'

describe('app', () => {
  context('when environment is set', () => {
    beforeEach(() => {
      process.env[ENV_ACCOUNT_ID] = 'dummy.testnet'
      process.env[ENV_PRIVATE_KEY] =
        'ed25519:3Zo9bWRC7vUoDHMaXdMd6osajUktbgGWxL3P89QxR8VguVPnFa7BXd5brw6tBa6RASn8YCVjPgkhpujnorCF7FR2'
    })

    it('server responds to /"', async () => {
      const app = await import('../src/app')
      const res = await request(app.default).get('/')
      expect(res).to.have.status(200)
      expect(res).to.have.header(
        'content-type',
        'application/json; charset=utf-8',
      )
      expect(res.body).not.null
      expect(res.body.chain_id).to.equal('testnet')
    })

    it('server responds to /account"', async () => {
      const app = await import('../src/app')
      const res = await request(app.default).get('/account')
      expect(res).to.have.status(200)
      expect(res).to.have.header(
        'content-type',
        'application/json; charset=utf-8',
      )
      expect(res.body).not.null
      expect(res.body.accountId).to.equal('dummy.testnet')
      expect(res.body.accessKey).to.equal(
        'ed25519:BZGHidhWFSKXUmHo2d6arxeJgthxECyFdgjW4P2GH4J4',
      )
    })
  })
})
