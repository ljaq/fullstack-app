import { container, ServiceTokens } from './container'
import { UserRepository } from 'server/repositories/user.repository'
import { RoleRepository } from 'server/repositories/role.repository'
import { AuthService } from 'server/services/auth.service'
import { UserService } from 'server/services/user.service'
import { RoleService } from 'server/services/role.service'

/**
 * 注册所有服务到容器
 */
export function registerServices() {
  // 注册 Repository 层（单例）
  container.registerSingleton(ServiceTokens.UserRepository, () => new UserRepository())
  container.registerSingleton(ServiceTokens.RoleRepository, () => new RoleRepository())

  // 注册 Service 层（单例）
  container.registerSingleton(ServiceTokens.AuthService, () => {
    const userRepo = container.resolve<UserRepository>(ServiceTokens.UserRepository)
    return new AuthService(userRepo)
  })

  container.registerSingleton(ServiceTokens.UserService, () => {
    const userRepo = container.resolve<UserRepository>(ServiceTokens.UserRepository)
    const roleRepo = container.resolve<RoleRepository>(ServiceTokens.RoleRepository)
    return new UserService(userRepo, roleRepo)
  })

  container.registerSingleton(ServiceTokens.RoleService, () => {
    const roleRepo = container.resolve<RoleRepository>(ServiceTokens.RoleRepository)
    return new RoleService(roleRepo)
  })
}

/**
 * 获取服务实例的便捷方法
 */
export function getService<T>(token: symbol): T {
  return container.resolve<T>(token)
}
