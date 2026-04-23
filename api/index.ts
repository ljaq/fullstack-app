import { createApiProxy, Fetch } from './fetch'
import * as api from './api'
import type { AppType } from 'api/app-type'

const request = createApiProxy<AppType, typeof api>(api)

export { Fetch, request }
