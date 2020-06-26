import * as bootstrap from '@chainlink/ea-bootstrap'
import { createRequest } from './adapter'

module.exports = {
  server: bootstrap.server.init(createRequest),

  gcpservice: bootstrap.serverless.initGcpService(createRequest),
  handler: bootstrap.serverless.initHandler(createRequest),
  handlerv2: bootstrap.serverless.initHandlerV2(createRequest),
}
