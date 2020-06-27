import BN from 'bn.js'
import * as nearApi from 'near-api-js'
import { ConnectConfig, AccountConfig } from './config'

export * from './config'

type Near = nearApi.Near
type Account = nearApi.Account
type FinalExecutionOutcome = nearApi.providers.FinalExecutionOutcome
type ViewOutcome = any

export type ContractCall = {
  contractId: string
  methodName: string
  args?: Record<string, unknown>
}
// Read state API input
export type View = ContractCall
// Write state API input
export type Call = ContractCall & {
  gas?: BN
  amount?: BN
}

// Initialize connection to the NEAR node.
export const connect = async (config: ConnectConfig): Promise<Near> =>
  await nearApi.connect(config)

// Initialize connection with account.
export const connectAccount = async (
  config: AccountConfig,
): Promise<Account> => {
  const near = await connect(config)
  return await near.account(config.masterAccount)
}

// View function using NEAR account
export const view = async (
  account: Account,
  input: View,
): Promise<ViewOutcome> =>
  await account.viewFunction(
    input.contractId,
    input.methodName,
    input.args || {},
  )

// Call function using NEAR account
export const call = async (
  account: Account,
  input: Call,
): Promise<FinalExecutionOutcome> =>
  await account.functionCall(
    input.contractId,
    input.methodName,
    input.args || {},
    input.gas,
    input.amount,
  )
