import React from 'react'

/**
 * 登录页骨架屏：居中表单卡片
 * 用于 HTML 注入与 Suspense fallback
 */
export default function Skeleton() {
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
        <div className="ant-skeleton-title" style={{ width: 120, marginTop: 0, height: 24 }} />
        <div className="ant-skeleton-input" style={{ width: '100%', marginTop: 24 }} />
        <div className="ant-skeleton-input" style={{ width: '100%', marginTop: 16 }} />
        <div className="ant-skeleton-button" style={{ width: '100%', height: 40, marginTop: 24 }} />
      </div>
    </div>
  )
}
