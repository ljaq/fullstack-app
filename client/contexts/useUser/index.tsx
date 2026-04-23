import { request } from 'api'
import React, { createContext, useCallback, useContext, useMemo } from 'react'
import { useLogout } from './hooks'
import { useLocalStorage } from 'react-use'
import { STORAGES } from 'utils/constant'

const INITIAL_STATE: UserState | null = null
const UserContext = createContext<any>(INITIAL_STATE)

type IThemeConfig = {
  color: string
}

export type UserState = {
  username?: string
  id?: number | string
  roles?: string[]
  pages?: string[]
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
  const [user, setUser] = useLocalStorage<Omit<UserState, 'themeConfig'>>(STORAGES.USER, {})
  const [themeConfig, setThemeConfig] = useLocalStorage<IThemeConfig>(STORAGES.THEME, { color: '#9254de' })
  const logout = useLogout()

  const getUser = useCallback(async () => {
    try {
      const res = await request.app.auth.me.get()
      setUser(res as Omit<UserState, 'themeConfig'>)
      return res
    } catch (err) {
      const emptyUser: Omit<UserState, 'themeConfig'> = {
        id: '',
        username: '',
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
