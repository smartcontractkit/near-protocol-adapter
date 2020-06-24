import { utils } from 'near-api-js'

const { ServerError } = utils.rpc_errors

const CODE_CLIENT_ERROR = 400
const CODE_SERVER_ERROR = 500

export class GeneralError extends Error {
  statusCode: number
  constructor(statusCode = CODE_SERVER_ERROR, ...args: any[]) {
    super(...args)
    this.statusCode = statusCode
    this.name = this.constructor.name
  }
}

export class BadRequest extends GeneralError {
  constructor(...args: any[]) {
    super(CODE_CLIENT_ERROR, ...args)
  }
}

export const handleErrors = (err: Error, req: any, res: any, next: any) => {
  // Log the error to the console
  console.error(err)

  const errorResponese = {
    status: err.name,
    type: err instanceof ServerError ? err.type : 'UntypedError',
    message: err.message,
  }

  if (err instanceof GeneralError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      ...errorResponese,
    })
  }

  return res.status(CODE_SERVER_ERROR).json({
    statusCode: CODE_SERVER_ERROR,
    ...errorResponese,
  })
}
