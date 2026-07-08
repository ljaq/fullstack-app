import { App as AntdApp, ConfigProvider, type ConfigProviderProps } from 'antd'
import type { ReactNode } from 'react'
import RoseCurveLoading from 'client/components/RoseCurveLoading'
import { antdZhCN } from 'client/utils/antd-locale'
import { themeToken } from 'client/utils/theme'

type AntdProviderProps = {
  children: ReactNode
  /** 包裹 Ant Design App 上下文（Modal/Message/Notification 静态能力） */
  withApp?: boolean
  theme?: ConfigProviderProps['theme']
}

export default function AntdProvider({ children, withApp = true, theme = themeToken }: AntdProviderProps) {
  const body = withApp ? <AntdApp>{children}</AntdApp> : children
  return (
    <ConfigProvider locale={antdZhCN} theme={theme} spin={{ indicator: <RoseCurveLoading /> }}>
      {body}
    </ConfigProvider>
  )
}
