/**
 * uni-app 全局类型声明
 */
declare global {
  const __UNI_PLATFORM__: string

  // 微信小程序
  const wx: any
  // 支付宝小程序
  const my: any
  // 百度小程序
  const swan: any
  // 头条小程序
  const tt: any
  // QQ小程序
  const qq: any

  // uni-app
  const uni: {
    getSystemInfoSync: () => any
  }
}

export {}
