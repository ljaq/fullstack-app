import { container, ServiceTokens } from './container'
import { UserRepository } from 'server/repositories/user.repository'
import { RoleRepository } from 'server/repositories/role.repository'
import { AuthService } from 'server/services/auth.service'
import { UserService } from 'server/services/user.service'
import { RoleService } from 'server/services/role.service'

/**
 * 获取服务实例的便捷方法
 */
export function getService() {
  return {
    get userRepo(): UserRepository {
      return container.resolve<UserRepository>(ServiceTokens.UserRepository)
    },
    get roleRepo(): RoleRepository {
      return container.resolve<RoleRepository>(ServiceTokens.RoleRepository)
    },
    get auth(): AuthService {
      return container.resolve<AuthService>(ServiceTokens.AuthService)
    },
    get user(): UserService {
      return container.resolve<UserService>(ServiceTokens.UserService)
    },
    get role(): RoleService {
      return container.resolve<RoleService>(ServiceTokens.RoleService)
    },
  }
}
