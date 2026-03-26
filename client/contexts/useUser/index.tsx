import { request } from 'api'
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
  roleName?: typeof Role.valueType
  id?: number | string
  roles?: string[]
  paegs?: string[]
  /** 合并后的按钮权限码（与 types/permissions Btn 一致） */
  buttons?: string[]
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
    try {
      const res = await request.jaq.auth.me.get()
      const u = res.user || {}
      const primaryRole = (u.roles && u.roles[0]) || Role.ADMIN.value
      const user: Omit<UserState, 'themeConfig'> = {
        id: u.id,
        userName: u.username,
        roleName: primaryRole,
        roles: u.roles || [],
        paegs: u.paegs || [],
        buttons: u.buttons || [],
      }
      setUser(user)
      return user
    } catch (err) {
      const emptyUser: Omit<UserState, 'themeConfig'> = {
        id: '',
        userName: '',
      }
      setUser(emptyUser)
      return emptyUser
    }
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
