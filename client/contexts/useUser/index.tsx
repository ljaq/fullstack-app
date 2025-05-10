import { request } from 'client/api'
import { ButtonAuthority, MenuAuthority } from 'client/utils/auth'
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useLogout } from './hooks'

const INITIAL_STATE: UserState | null = null
const UserContext = createContext<any>(INITIAL_STATE)

export type UserState = {
  userName?: string
  authList?: (MenuAuthority | ButtonAuthority)[]
  roleName?: string
  id?: string
}

export function useUser(): [UserState, { getUser: () => Promise<UserState>; logout: () => void }] {
  return useContext(UserContext)
}

export default function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>({})
  const logout = useLogout()

  const getUser = useCallback(async () => {
    let user: UserState
    try {
      const res = await request.authority.getXSRF({ method: 'GET' })
      const userInfo = await request.authority.userInfo({ method: 'GET' })
      const roleName = res?.currentUser?.roles?.[0]
      const auth = res?.auth?.grantedPolicies || {}
      const userName = res?.currentUser?.userName
      const authList = Object.keys(auth).filter(item => item.includes('SinodacServerPermissions.'))
      if (roleName === 'admin') authList.push(MenuAuthority.超级管理员)
      user = {
        userName: userName,
        roleName: roleName,
        authList: authList as (MenuAuthority | ButtonAuthority)[],
        ...userInfo,
      }
    } catch (err) {
      user = {
        id: '',
        userName: '',
        roleName: '',
        authList: [],
      }
    }
    setUser(user)
    return user
  }, [])

  return (
    <UserContext.Provider value={useMemo(() => [{ ...user }, { getUser, logout }], [user, getUser, logout])}>
      {children}
    </UserContext.Provider>
  )
}
