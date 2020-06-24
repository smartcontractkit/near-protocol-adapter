import express from 'express'
import asyncHandler from 'express-async-handler'

import * as nearApi from 'near-api-js'

import config, { cloneWithoutSecrets } from './config'
import {
  ENV_PORT,
  ENV_NODE_ENV,
  ENV_ACCOUNT_ID,
  ENV_PRIVATE_KEY,
  getRequiredEnv,
} from './config_env'

const connectionConfig = config(
  process.env[ENV_NODE_ENV],
  getRequiredEnv(ENV_ACCOUNT_ID),
  getRequiredEnv(ENV_PRIVATE_KEY),
)
console.log('NEAR Protocol connection configuration:')
console.log(cloneWithoutSecrets(connectionConfig))

const app = express()
const port = 3000 || process.env[ENV_PORT]

// connect to the network and check status
app.get(
  '/',
  asyncHandler(async (_, res) => {
    // Initializing connection to the NEAR node.
    const near = await nearApi.connect(connectionConfig)
    const networkStatus = await near.connection.provider.status()
    res.send(networkStatus)
  }),
)

// get the configured master account details
app.get(
  '/account',
  asyncHandler(async (_, res) => {
    const { networkId, masterAccount } = connectionConfig
    const { keyStore } = connectionConfig.deps
    const keyPair = await keyStore.getKey(networkId, masterAccount)
    res.send({
      account_id: masterAccount,
      access_key: keyPair.getPublicKey().toString(),
    })
  }),
)

// make smart contract call which can view state
app.get('/view', (req, res) => {
  res.send('NEAR Protocol Adapter view stub!')
})

// schedule smart contract call which can modify state
app.post('/call', (req, res) => {
  res.send('NEAR Protocol Adapter call stub!')
})

app.listen(port, (err: Error) => {
  if (err) return console.error(err)
  return console.log(`Server is listening on port:${port}`)
})

// Export our app for testing purposes
export default app
