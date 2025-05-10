import storages from 'client/storages'
import { toLogin } from 'client/utils/common'
import { useCallback } from 'react'
import { useCookie, useLocalStorage } from 'react-use'

export const useLogout = () => {
  const [, , removeToken] = useLocalStorage(storages.TOKEN)
  const [, , removeXSRF] = useCookie(storages.XSRF)

  const logout = useCallback(() => {
    toLogin()
    removeToken()
    removeXSRF()
  }, [])
  return logout
}
