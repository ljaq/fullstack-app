import { Fetch, paseRequest } from './utils'
import { API_REQ_FUNCTION } from './types'
import * as serverApi from './serverApi'
import * as api from './api'

const request = {
  ...Object.keys(serverApi).reduce(
    (prev, next) => {
      prev[next] = paseRequest(serverApi[next])
      return prev
    },
    {} as API<typeof serverApi>,
  ),

  ...Object.keys(api).reduce(
    (prev, next) => {
      prev[next] = paseRequest(api[next])
      return prev
    },
    {} as API<typeof api>,
  ),
}

export { Fetch, request }
