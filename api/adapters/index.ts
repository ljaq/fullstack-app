/**
 * 平台适配器导出入口
 *
 * 根据环境自动选择适配器：
 * - Web 环境：使用 Web 适配器（浏览器 API）
 * - 小程序环境：使用内联小程序适配器（uni-app API）
 */
import type { IPlatformAdapter } from './platform.interface'
import { createWebAdapter } from './web'
import { createMiniAdapter } from './mini'

// 声明全局变量（uni-app 小程序环境）
declare global {
  const __UNI_PLATFORM__: string | undefined
  const wx: any
  const uni: any
}

/**
 * 检测是否为小程序环境
 */
function isMiniProgramEnv(): boolean {
  // 编译时检测（uni-app 构建时会定义这些变量）
  if (typeof __UNI_PLATFORM__ !== 'undefined') {
    return __UNI_PLATFORM__ !== 'h5'
  }

  // 运行时检测全局对象
  return typeof wx !== 'undefined' || typeof uni !== 'undefined'
}

/**
 * 平台适配器实例
 *
 * 根据环境自动选择
 */
export const platformAdapter: IPlatformAdapter = isMiniProgramEnv()
  ? createMiniAdapter()
  : createWebAdapter()

