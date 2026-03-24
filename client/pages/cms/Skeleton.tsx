import React from 'react'
import { Card, Skeleton, Spin } from 'antd'

/**
 * CMS 页骨架屏
 */

export function ContentSkeleton() {
  return (
    <Spin size='large' spinning>
      <div style={{ height: 'calc(100vh - 130px)' }} />
    </Spin>
  )
}

export default function DefaultSkeleton() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', background: 'linear-gradient(#fff,#f5f5f5 28%)' }}>
      <aside
        style={{
          width: 200,
          flexShrink: 0,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <Skeleton.Avatar active size={32} />
          <Skeleton.Input active size='small' style={{ width: 80, marginLeft: 8 }} />
        </div>
        <div style={{ flex: 1, padding: 8 }}>
          <Skeleton active title={{ width: '100%' }} paragraph={false} style={{ marginBottom: 16 }} />
          <Skeleton active title={{ width: '70%' }} paragraph={false} style={{ marginBottom: 16 }} />
          <Skeleton active title={{ width: '90%' }} paragraph={false} style={{ marginBottom: 16 }} />
          <Skeleton active title={{ width: '60%' }} paragraph={false} style={{ marginBottom: 16 }} />
        </div>
        <div style={{ height: 56, padding: '0 8px', display: 'flex', alignItems: 'center' }}>
          <Skeleton.Avatar active size={24} />
          <Skeleton.Input active size='small' style={{ width: 48, marginLeft: 8 }} />
        </div>
      </aside>
      <main style={{ flex: 1, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <header
          style={{
            height: 56,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '0 40px',
          }}
        >
          <Skeleton.Input active size='small' style={{ width: 120 }} />
          <Skeleton.Input active size='small' style={{ width: 80, marginLeft: 16 }} />
        </header>
        <ContentSkeleton />
      </main>
    </div>
  )
}
