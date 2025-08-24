import { request } from 'client/api'
import { ButtonAuthority, MenuAuthority } from 'client/utils/auth'
import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { useLogout } from './hooks'
import { useLocalStorage } from 'react-use'
import storages from 'client/storages'
import { Role } from 'types/enum'

const INITIAL_STATE: UserState | null = null
const UserContext = createContext<any>(INITIAL_STATE)

type IThemeConfig = {
  color: string
}

export type UserState = {
  userName?: string
  authList?: (MenuAuthority | ButtonAuthority)[]
  roleName?: typeof Role.valueType
  id?: string
  themeConfig: IThemeConfig
}

export function useUser(): [
  UserState,
  { getUser: () => Promise<UserState>; logout: () => void; setThemeConfig: (themeConfig: IThemeConfig) => void },
] {
  return useContext(UserContext)
}

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useLocalStorage<Omit<UserState, 'themeConfig'>>(storages.USER, {})
  const [themeConfig, setThemeConfig] = useLocalStorage<IThemeConfig>(storages.THEME, { color: '#9254de' })
  const logout = useLogout()

  const getUser = useCallback(async () => {
    let user: Omit<UserState, 'themeConfig'>
    try {
      const res = await request.authority.getXSRF({ method: 'GET' })
      const roleName = res?.data?.currentUser?.roles?.[0]
      const auth = res?.data?.auth?.grantedPolicies || {}
      const userName = res?.data?.currentUser?.userName
      const authList = Object.keys(auth).filter(item => item.includes('SinodacServerPermissions.'))
      if (roleName === 'admin') authList.push(MenuAuthority.超级管理员)
      user = {
        userName: userName,
        roleName: roleName,
        authList: authList as (MenuAuthority | ButtonAuthority)[],
      }
    } catch (err) {
      user = {
        id: '',
        userName: '',
        authList: [],
      }
    }
    setUser(user)
    return user
  }, [])

  return (
    <UserContext.Provider
      value={useMemo(
        () => [
          { ...user, themeConfig },
          { getUser, logout, setThemeConfig },
        ],
        [user, themeConfig, getUser, logout, setThemeConfig],
      )}
    >
      {children}
    </UserContext.Provider>
  )
}
