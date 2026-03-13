import React from 'react'
import { Skeleton } from 'antd'

/**
 * CMS 页骨架屏
 */

export function ContentSkeleton() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '16px 32px', position: 'relative' }}>
      <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Skeleton.Input active style={{ width: 160 }} />
        <Skeleton.Input active style={{ width: 120 }} />
        <Skeleton.Input active style={{ width: 200 }} />
        <Skeleton.Button active />
      </div>
      <div
        style={{
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 8,
          padding: 16,
          background: '#fff',
        }}
      >
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <Skeleton.Input active size='small' style={{ width: 60 }} />
          <Skeleton.Input active size='small' style={{ width: 60 }} />
          <Skeleton.Input active size='small' style={{ width: 60 }} />
        </div>
        <Skeleton active paragraph={{ rows: 5 }} />
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton.Input active size='small' style={{ width: 80 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Skeleton.Button active size='small' style={{ width: 32 }} />
            <Skeleton.Button active size='small' style={{ width: 32 }} />
          </div>
        </div>
      </div>
    </div>
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
          }}
        >
          <Skeleton.Avatar active />
          <Skeleton.Input active size='small' style={{ width: 80, marginLeft: 8 }} />
        </div>
        <div style={{ flex: 1, padding: '0 8px' }}>
          <Skeleton.Input block active style={{ marginBottom: 10 }} />
          <Skeleton.Input block active style={{ marginBottom: 10 }} />
          <Skeleton.Input block active style={{ marginBottom: 10 }} />
          <Skeleton.Input block active style={{ marginBottom: 10 }} />
          <Skeleton.Input block active style={{ marginBottom: 10 }} />
        </div>
        <div style={{ height: 56, padding: '0 8px', display: 'flex', alignItems: 'center' }}>
          <Skeleton.Avatar active />
          <Skeleton.Input active size='small' style={{ width: 48, marginLeft: 8 }} />
        </div>
      </aside>
      <main
        style={{
          flex: 1,
          height: '100vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff80',
        }}
      >
        <header
          style={{
            height: 56,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            padding: '0 32px',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
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
