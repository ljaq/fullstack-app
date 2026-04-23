/**
 * 复用仓库内小程序适配器实现，与 `api/adapters/platform.interface` 保持一致（含 ICrypto 全量方法）。
 */
import { createMiniAdapter } from '../../api/adapters/mini/index'

export const platformAdapter = createMiniAdapter()

export type { IPlatformAdapter } from '../../api/adapters/platform.interface'
