/**
 * 小程序专用 API 模块导出
 *
 * 这个文件在 mini-program 中覆盖 /api 模块的部分导出
 * 确保使用正确的平台适配器
 */

// 重新导出 request 和 Fetch（使用原始 api 模块）
export { request, Fetch } from '../../api/index'

// 导出本地适配器
export { platformAdapter } from './adapters'
