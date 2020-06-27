import express, { Request, Response } from 'express'
import asyncHandler from 'express-async-handler'

import { handleNotFound, handleErrors, BadRequest } from './errors'
import { connectionConfig, ENV_PORT } from './config'
import {
  cloneNoSecrets,
  connect,
  connectAccount,
  ContractCall,
  View,
  Call,
  view,
  call,
} from './near'

const config = connectionConfig()
console.log('NEAR Protocol connection configuration:')
console.log(cloneNoSecrets(config))

const app = express()
app.use(express.json())

// Connect to the network and check status
app.get(
  '/',
  asyncHandler(async (_, res: Response) => {
    const near = await connect(config)
    const networkStatus = await near.connection.provider.status()
    res.send(networkStatus)
  }),
)

// Get the configured master account details
app.get(
  '/account',
  asyncHandler(async (_, res: Response) => {
    const { networkId, masterAccount, keyStore } = config
    const keyPair = await keyStore.getKey(networkId, masterAccount)
    res.send({
      accountId: masterAccount,
      accessKey: keyPair.getPublicKey().toString(),
    })
  }),
)

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

    const account = await connectAccount(config)
    const result = await view(account, input)

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

    const account = await connectAccount(config)
    const result = await call(account, input)

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
