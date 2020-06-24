import express from 'express'
import asyncHandler from 'express-async-handler'

import * as nearApi from 'near-api-js'

import { handleErrors, BadRequest } from './errors'
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
app.use(express.json())

const port = 3000 || process.env[ENV_PORT]

// Initializing connection to the NEAR node.
const connect = async () => await nearApi.connect(connectionConfig)

const connectWithMasterAccount = async () => {
  const near = await connect()
  const { masterAccount } = connectionConfig
  return await near.account(masterAccount)
}

// connect to the network and check status
app.get(
  '/',
  asyncHandler(async (_, res) => {
    const near = await connect()
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
      accountId: masterAccount,
      accessKey: keyPair.getPublicKey().toString(),
    })
  }),
)

// make smart contract call which can view state
app.get(
  '/view',
  asyncHandler(async (req, res) => {
    const account = await connectWithMasterAccount()
    const { contractId, methodName, args } = req.body
    if (!contractId || !methodName)
      throw new BadRequest('Missing required fields: contractId or methodName')

    const result = await account.viewFunction(
      contractId as string,
      methodName as string,
      args || {},
    )
    console.log('View result: ', result)
    res.status(200).json({
      data: result,
      statusCode: 200,
    })
  }),
)

// schedule smart contract call which can modify state
app.post(
  '/call',
  asyncHandler(async (req, res) => {
    const account = await connectWithMasterAccount()
    const { contractId, methodName, args, gas, amount } = req.body
    if (!contractId || !methodName)
      throw new BadRequest('Missing required fields: contractId or methodName')

    const result = await account.functionCall(
      contractId as string,
      methodName as string,
      args || {},
      gas,
      amount,
    )
    console.log('Call result: ', result)
    res.status(200).json({
      data: result,
      statusCode: 200,
    })
  }),
)

app.use(handleErrors)

app.listen(port, (err: Error) => {
  if (err) return console.error(err)
  return console.log(`Server is listening on port:${port}`)
})

// Export our app for testing purposes
export default app
