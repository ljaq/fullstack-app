import { STORAGES } from 'utils/constant'
import { toLogin } from 'client/utils/common'
import { useCallback } from 'react'
import { useCookie, useLocalStorage } from 'react-use'

export const useLogout = () => {
  const [, , removeToken] = useLocalStorage(STORAGES.TOKEN)
  const [, , removeUser] = useLocalStorage(STORAGES.USER, {} as Record<string, unknown>)
  const [, , removeXSRF] = useCookie(STORAGES.XSRF)

  const logout = useCallback(() => {
    removeToken()
    removeUser()
    removeXSRF()
    toLogin()
  }, [])
  return logout
}
