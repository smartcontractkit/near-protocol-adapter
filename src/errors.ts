import { Request, Response, NextFunction } from 'express'
import { utils } from 'near-api-js'

const { ServerError } = utils.rpc_errors

const CODE_CLIENT_ERROR = 400
const CODE_CLIENT_ERROR_NOT_FOUND = 404
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

type ErrorResponse = {
  statusCode: number
  status: string
  type?: string
  message?: string
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export const handleNotFound = (
  req: Request,
  res: Response,
  next: NextFunction,
): Response<ErrorResponse> => {
  return res.status(CODE_CLIENT_ERROR_NOT_FOUND).json({
    statusCode: CODE_CLIENT_ERROR_NOT_FOUND,
    status: 'Error',
    type: 'NotFound',
    message: '404 Not Found',
  })
}

/* eslint-disable @typescript-eslint/no-unused-vars */
export const handleErrors = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
): Response<ErrorResponse> => {
  // Log the error to the console
  console.error(err)

  const errorResponse = {
    status: err.name,
    type: err instanceof ServerError ? err.type : 'UntypedError',
    message: err.message,
  }

  if (err instanceof GeneralError) {
    return res.status(err.statusCode).json({
      statusCode: err.statusCode,
      ...errorResponse,
    })
  }

  return res.status(CODE_SERVER_ERROR).json({
    statusCode: CODE_SERVER_ERROR,
    ...errorResponse,
  })
}
