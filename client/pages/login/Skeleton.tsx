import React from 'react'
import { Skeleton } from 'antd'

/**
 * 登录页骨架屏：居中表单卡片
 * 使用 antd Skeleton 组件
 */
export default function LoginSkeleton(_props?: { pathname?: string }) {
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
      <div
        style={{
          width: 360,
          padding: 32,
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 8,
          background: '#fff',
        }}
      >
        <Skeleton active title={{ width: 120 }} paragraph={false} />
        <Skeleton.Input active style={{ width: '100%', marginTop: 24 }} />
        <Skeleton.Input active style={{ width: '100%', marginTop: 16 }} />
        <Skeleton.Button active style={{ width: '100%', height: 40, marginTop: 24 }} />
      </div>
    </div>
  )
}
