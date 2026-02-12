import { Skeleton } from 'antd'

/**
 * 登录页骨架屏
 */
export default function LoginSkeleton() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Skeleton active paragraph={{ rows: 4 }} style={{ width: 360 }} />
    </div>
  )
}
