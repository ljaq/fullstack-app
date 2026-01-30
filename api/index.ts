import { createApiProxy, Fetch } from './fetch'
import * as api from './api'
import { AppType } from 'app'

const request = createApiProxy<AppType, typeof api>(api)

export { Fetch, request }
