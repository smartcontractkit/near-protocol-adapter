import BN from 'bn.js'
import * as nearApi from 'near-api-js'
import { Requester, Validator } from '@chainlink/external-adapter'

import {
  connectionConfig,
  getRequiredEnv,
  ENV_CONTRACT_ID,
  ENV_METHOD_NAME,
  ENV_GAS,
  ENV_AMOUNT,
  DEFAULT_ENV_GAS,
  DEFAULT_ENV_AMOUNT,
} from './config'
import { connectAccount, Call, call, logConfig, AccountConfig } from './near'

type Base64String = string
type RequestFulfillmentArgs = {
  account: string
  nonce: string
}

// ChainlinkRequestFulfillmentArgs contains the input arguments received from the Chainlink node
type ChainlinkRequestFulfillmentArgs = RequestFulfillmentArgs & {
  value: number
}
// OracleRequestFulfillmentArgs contains the arguments for oracle 'fulfill_request' function
type OracleRequestFulfillmentArgs = RequestFulfillmentArgs & {
  data: Base64String
}
type JobSpecRequest = { id: string; data: ChainlinkRequestFulfillmentArgs }
type FinalExecutionOutcome = nearApi.providers.FinalExecutionOutcome
type Callback = (statusCode: number, data: Record<string, unknown>) => void

const inputParams = {
  account: true,
  nonce: true,
  value: ['result', 'value'],
}

type AdapterConfig = AccountConfig & {
  adapter: {
    contractId: string
    methodName: string
    gas: BN
    amount: BN
  }
}

const config: AdapterConfig = {
  ...connectionConfig(),
  adapter: {
    contractId: getRequiredEnv(ENV_CONTRACT_ID),
    methodName: getRequiredEnv(ENV_METHOD_NAME),
    gas: new BN(process.env[ENV_GAS] || DEFAULT_ENV_GAS),
    amount: new BN(process.env[ENV_AMOUNT] || DEFAULT_ENV_AMOUNT),
  },
}
logConfig(config)

// Export function to integrate with Chainlink node
export const createRequest = (
  request: JobSpecRequest,
  callback: Callback,
): void => {
  const validator = new Validator(callback, request, inputParams)
  const jobRunID = validator.validated.id

  const _handleResponse = (out: FinalExecutionOutcome) =>
    callback(
      200,
      Requester.success(jobRunID, {
        data: { result: out.transaction.hash },
        result: out.transaction.hash,
        status: 200,
      }),
    )

  const _handleError = (err: Error) =>
    callback(500, Requester.errored(jobRunID, err))

  const { data } = validator.validated
  const args: OracleRequestFulfillmentArgs = {
    account: data.account,
    nonce: data.nonce,
    data: Buffer.from(data.value.toString()).toString('base64'),
  }

  const input: Call = {
    contractId: config.adapter.contractId,
    methodName: config.adapter.methodName,
    args,
    gas: config.adapter.gas,
    amount: config.adapter.amount,
  }

  connectAccount(config)
    .then((account) => call(account, input))
    .then(_handleResponse)
    .catch(_handleError)
}
