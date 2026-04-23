import { request } from 'api'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { STORAGES } from 'utils/constant'

/**
 * 与 `GET /app/auth/me` 的 JSON 一致。登录/注册另含 `token`，需 `uni.setStorageSync(STORAGES.TOKEN, token)`。
 * （不含 passwordHash 等敏感字段）
 */
export interface AppUser {
  id: number
  username: string
  /** 角色编码，与 `Role.role` 一致 */
  roles: string[]
  roleNames: string[]
  pages: string[]
  /** 按钮权限码，如 `btn:user:edit` */
  buttons: string[]
}

export const useUserStore = defineStore('user', () => {
  const user = ref<Partial<AppUser>>((uni.getStorageSync(STORAGES.USER) as Partial<AppUser> | null) || {})

  const isLogin = computed(() => user.value.id != null)
  /** 与后端 `requirePermission` 中管理员放行规则一致 */
  const isAdmin = computed(() => user.value.roles?.includes('admin') ?? false)

  const setUser = (u: Partial<AppUser>) => {
    uni.setStorageSync(STORAGES.USER, u)
    user.value = u
  }

  const removeUser = () => {
    uni.removeStorageSync(STORAGES.USER)
    user.value = {}
  }

  const getUser = async () => {
    try {
      const me = (await request.app.auth.me.get()) as AppUser
      setUser(me)
      return me
    } catch (err) {
      setUser({})
      console.log('getUser error', err)
    }
  }

  const logout = (params?: { redirect?: boolean }) => {
    const { redirect } = params || {}
    void request.app.auth.logout.post().catch(() => undefined)
    removeUser()
    try {
      uni.removeStorageSync(STORAGES.TOKEN)
    } catch {
      /* noop */
    }
    if (redirect) {
      uni.reLaunch({ url: '/pages/index/index' })
    }
  }

  /** 是否具备某按钮权限（admin 在服务端会放行；此处作前端展示参考） */
  const hasButton = (code: string) => isAdmin.value || (user.value.buttons?.includes(code) ?? false)

  return { user, isLogin, isAdmin, getUser, logout, hasButton }
})
