/**
 * 第三方 API URL 树（走 `/api/*` 网关代理，与自建 `/app/*` 区分）。
 * 按实际对接的第三方服务填写路径；`request.authority.*` 链式调用依赖此结构。
 */
export const authority = {
  /** 示例：OAuth token 端点 */
  login: '/connect/token',
  /** 示例：用户信息 */
  userInfo: '/api/example/user-info',
}
