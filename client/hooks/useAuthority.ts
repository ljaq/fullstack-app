import { useUser } from 'client/contexts/useUser'
import { useCallback } from 'react'
import { Role } from 'types/enum'

export const useAuthority = () => {
  const [{ roleName, pages }] = useUser()

  const hasAuthority = useCallback(
    (auth?: string | string[]) => {
      if (!auth) {
        return true
      }
      if (Array.isArray(auth)) {
        return auth.includes(roleName!)
      }
      if (roleName === Role.ADMIN) {
        return true
      }
      return roleName === auth
    },
    [roleName],
  )

  return { hasAuthority, roleName, pages }
}
