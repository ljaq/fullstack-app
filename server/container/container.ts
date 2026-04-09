/**
 * 简单的依赖注入容器
 * 管理服务实例的生命周期和依赖关系
 */

type ServiceConstructor<T> = new (...args: any[]) => T
type ServiceFactory<T> = () => T
type ServiceIdentifier<T> = string | ServiceConstructor<T> | symbol

interface ServiceDescriptor<T> {
  factory: ServiceFactory<T>
  singleton: boolean
  instance?: T
}

/**
 * 服务容器
 */
export class Container {
  private services = new Map<ServiceIdentifier<any>, ServiceDescriptor<any>>()

  /**
   * 注册服务（单例）
   */
  registerSingleton<T>(identifier: ServiceIdentifier<T>, factory: ServiceFactory<T>): void {
    this.services.set(identifier, {
      factory,
      singleton: true,
    })
  }

  /**
   * 注册服务（每次请求都创建新实例）
   */
  registerTransient<T>(identifier: ServiceIdentifier<T>, factory: ServiceFactory<T>): void {
    this.services.set(identifier, {
      factory,
      singleton: false,
    })
  }

  /**
   * 解析服务
   */
  resolve<T>(identifier: ServiceIdentifier<T>): T {
    const descriptor = this.services.get(identifier)

    if (!descriptor) {
      throw new Error(`Service not registered: ${String(identifier)}`)
    }

    // 单例模式：返回已存在的实例
    if (descriptor.singleton && descriptor.instance) {
      return descriptor.instance
    }

    // 创建新实例
    const instance = descriptor.factory()

    // 单例模式：缓存实例
    if (descriptor.singleton) {
      descriptor.instance = instance
    }

    return instance
  }

  /**
   * 检查服务是否已注册
   */
  has(identifier: ServiceIdentifier<any>): boolean {
    return this.services.has(identifier)
  }

  /**
   * 清除所有单例实例
   */
  clear(): void {
    this.services.forEach(descriptor => {
      descriptor.instance = undefined
    })
  }
}

/**
 * 全局容器实例
 */
export const container = new Container()

/**
 * 服务标识符
 */
export const ServiceTokens = {
  UserRepository: Symbol('UserRepository'),
  RoleRepository: Symbol('RoleRepository'),
  AuthService: Symbol('AuthService'),
  UserService: Symbol('UserService'),
  RoleService: Symbol('RoleService'),
} as const
