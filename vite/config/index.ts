/**
 * Vite 配置按环境与 mode 拆分：
 *
 * - env.ts        环境变量与页列表（getEnv, getPageDirs）
 * - shared.ts     共用 resolve/alias
 * - server.ts     开发环境 Dev Server
 * - build-client.ts  mode=client 时的前端构建
 * - build-server.ts  mode=server 时的构建选项
 * - plugins.ts    插件列表（按 mode 条件启用）
 */

export { getEnv, getPageDirs, isHttps, rootDir } from './env'
export { getSharedResolve } from './shared'
export { getServerConfig } from './server'
export { getClientBuildConfig } from './build-client'
export { getServerBuildConfig } from './build-server'
export { getPlugins } from './plugins'
