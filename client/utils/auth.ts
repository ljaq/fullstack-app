import { useUser } from 'client/contexts/useUser'
import { useCallback } from 'react'

export enum MenuAuthority {
  超级管理员 = 'IsAdmin',
  角色管理 = 'SinodacServerPermissions.BackgroundManagerModule.RolePermissionManagerModule',
  账号管理 = 'SinodacServerPermissions.BackgroundManagerModule.BusinessAccountManagerModule',
  用户管理 = 'SinodacServerPermissions.CustomerAccountManagerModule',
  发行方管理 = 'SinodacServerPermissions.IssuerManagerModule',
  订单管理 = 'SinodacServerPermissions.OrderManagerModule',
  藏品系列管理 = 'SinodacServerPermissions.NftShowTypeManagerModule.NftSeriesManagerModule',
  藏品管理 = 'SinodacServerPermissions.NftManagerModule',
}

export enum ButtonAuthority {}

type Authority = MenuAuthority | ButtonAuthority

export const useAuthority = () => {
  const [{ authList, roleName }] = useUser()

  const hasAuthority = useCallback(
    (auth?: Authority | Authority[]) => {
      return true
      if (!authList) return false
      if (roleName === 'admin' || auth === undefined) return true

      if (Array.isArray(auth)) {
        return authList.some(item => auth.includes(item))
      } else {
        return authList.includes(auth)
      }
    },
    [authList, roleName],
  )

  return { hasAuthority, authList, roleName }
}