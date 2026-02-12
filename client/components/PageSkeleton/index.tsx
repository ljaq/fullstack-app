import { Skeleton } from 'antd'

/**
 * 页面级骨架屏，用于 Suspense fallback，减少白屏感知
 */
export default function PageSkeleton() {
  return (
    <div style={{ padding: '24px 40px' }}>
      <Skeleton active paragraph={{ rows: 4 }} />
      <Skeleton active paragraph={{ rows: 6 }} style={{ marginTop: 24 }} />
    </div>
  )
}
