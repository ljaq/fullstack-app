import { createApiProxy, Fetch } from './fetch'
import { clearAuthRefresh, registerAuthRefresh } from './auth-refresh'
import * as api from './api'
import type { AppType } from 'api/app-type'

const request = createApiProxy<AppType, typeof api>(api)

export { clearAuthRefresh, Fetch, registerAuthRefresh, request }
