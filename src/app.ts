import express, { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'

import BN from 'bn.js'
import * as nearApi from 'near-api-js'

import { handleNotFound, handleErrors, BadRequest } from './errors'
import { configFrom, configFromEnv, cloneWithoutSecrets } from './config'
import {
  ENV_PORT,
  ENV_NODE_ENV,
  ENV_NETWORK_ID,
  ENV_NODE_URL,
  ENV_ACCOUNT_ID,
  ENV_PRIVATE_KEY,
  getRequiredEnv,
} from './config_env'

const connectionConfig = (function () {
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
})()

console.log('NEAR Protocol connection configuration:')
console.log(cloneWithoutSecrets(connectionConfig))

const app = express()
app.use(express.json())

// Initializing connection to the NEAR node.
const connect = async () => await nearApi.connect(connectionConfig)

const connectWithMasterAccount = async () => {
  const near = await connect()
  const { masterAccount } = connectionConfig
  return await near.account(masterAccount)
}

// Connect to the network and check status
app.get(
  '/',
  asyncHandler(async (_, res: Response) => {
    const near = await connect()
    const networkStatus = await near.connection.provider.status()
    res.send(networkStatus)
  }),
)

// Get the configured master account details
app.get(
  '/account',
  asyncHandler(async (_, res: Response) => {
    const { networkId, masterAccount } = connectionConfig
    const { keyStore } = connectionConfig.deps
    const keyPair = await keyStore.getKey(networkId, masterAccount)
    res.send({
      accountId: masterAccount,
      accessKey: keyPair.getPublicKey().toString(),
    })
  }),
)

type ContractCall = {
  contractId: string
  methodName: string
  args?: Record<string, unknown>
}

// Read state API input
type View = ContractCall

// Write state API input
type Call = ContractCall & {
  gas?: BN
  amount?: BN
}

// Validate API input
const validate = (input: ContractCall) => {
  const { contractId, methodName } = input
  if (!contractId || !methodName)
    throw new BadRequest('Missing required fields: contractId or methodName')
}

// Read contract call which can view state
app.get(
  '/view',
  asyncHandler(async (req: Request, res: Response) => {
    const input: View = req.body
    validate(input)

    const account = await connectWithMasterAccount()
    const result = await account.viewFunction(
      input.contractId,
      input.methodName,
      input.args || {},
    )
    console.log('View result: ', result)
    res.status(200).json({
      data: result,
      statusCode: 200,
    })
  }),
)

// Write contract call which can modify state
app.post(
  '/call',
  asyncHandler(async (req: Request, res: Response) => {
    const input: Call = req.body
    validate(input)

    const account = await connectWithMasterAccount()
    const result = await account.functionCall(
      input.contractId,
      input.methodName,
      input.args || {},
      input.gas,
      input.amount,
    )
    console.log('Call result: ', result)
    res.status(200).json({
      data: result,
      statusCode: 200,
    })
  }),
)

// Error handling middleware
app.use(handleNotFound)
app.use(handleErrors)

const port = parseInt(process.env[ENV_PORT] as string) || 3000

app.listen(port, (err: Error) => {
  if (err) return console.error(err)
  return console.log(`Server is listening on port:${port}`)
})

// Export our app for testing purposes
export default app
