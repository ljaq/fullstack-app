import React from 'react'
import { Skeleton } from 'antd'

/**
 * 404 页骨架屏：简单居中
 * 使用 antd Skeleton 组件
 */
export default function PageSkeleton(_props?: { pathname?: string }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(#fff,#f5f5f5)',
      }}
    >
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Skeleton active title={{ width: 200 }} paragraph={{ rows: 2 }} />
      </div>
    </div>
  )
}
