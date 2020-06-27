import * as nearApi from 'near-api-js'
import { Requester, Validator } from '@chainlink/external-adapter'

import { connectionConfig } from './config'
import { connectAccount, Call, call } from './near'

type FinalExecutionOutcome = nearApi.providers.FinalExecutionOutcome
type JobSpecRequest = { id: string; data: Call }
type Callback = (statusCode: number, data: Record<string, unknown>) => void

// Export function to integrate with Chainlink node
export const createRequest = (
  request: JobSpecRequest,
  callback: Callback,
): void => {
  const validator = new Validator(callback, request, {})
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

  const config = connectionConfig()
  connectAccount(config)
    .then((account) => call(account, request.data))
    .then(_handleResponse)
    .catch(_handleError)
}
