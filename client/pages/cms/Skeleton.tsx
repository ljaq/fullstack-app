import React from 'react'

/**
 * CMS 页骨架屏：支持按路由配置不同骨架，默认表格布局
 * 用于 HTML 注入与 Suspense fallback
 */

function DefaultSkeleton() {
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
          <div className="ant-skeleton-avatar" style={{ width: 32, height: 32 }} />
          <div className="ant-skeleton-title" style={{ width: 80, marginLeft: 8, marginTop: 0 }} />
        </div>
        <div style={{ flex: 1, padding: 8 }}>
          <div className="ant-skeleton-title" style={{ width: '100%' }} />
          <div className="ant-skeleton-title" style={{ width: '70%' }} />
          <div className="ant-skeleton-title" style={{ width: '90%' }} />
          <div className="ant-skeleton-title" style={{ width: '60%' }} />
        </div>
        <div style={{ height: 56, padding: '0 8px', display: 'flex', alignItems: 'center' }}>
          <div className="ant-skeleton-avatar" style={{ width: 24, height: 24 }} />
          <div className="ant-skeleton-title" style={{ width: 48, marginLeft: 8, marginTop: 0 }} />
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
            borderBottom: '1px solid rgba(0,0,0,0.06)',
          }}
        >
          <div className="ant-skeleton-title" style={{ width: 120, marginTop: 0 }} />
          <div className="ant-skeleton-title" style={{ width: 80, marginLeft: 16, marginTop: 0 }} />
        </header>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 40px 32px' }}>
          <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div className="ant-skeleton-input" style={{ width: 160 }} />
            <div className="ant-skeleton-input" style={{ width: 120 }} />
            <div className="ant-skeleton-input" style={{ width: 200 }} />
            <div className="ant-skeleton-button" />
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
              <div className="ant-skeleton-title" style={{ width: 60, marginTop: 0 }} />
              <div className="ant-skeleton-title" style={{ width: 60, marginTop: 0 }} />
              <div className="ant-skeleton-title" style={{ width: 60, marginTop: 0 }} />
            </div>
            <ul className="ant-skeleton-paragraph">
              <li style={{ width: '100%' }} />
              <li style={{ width: '95%' }} />
              <li style={{ width: '98%' }} />
              <li style={{ width: '90%' }} />
              <li style={{ width: '92%' }} />
            </ul>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="ant-skeleton-title" style={{ width: 80, marginTop: 0 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <div className="ant-skeleton-button" style={{ width: 32 }} />
                <div className="ant-skeleton-button" style={{ width: 32 }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/** 可扩展：为不同路由配置不同骨架组件 */
export const routeSkeletons: Record<string, React.ComponentType> = {
  // '/cms/about': AboutSkeleton,
  // '/cms/list': ListSkeleton,
}

export default function Skeleton({ pathname }: { pathname?: string }) {
  const SkeletonComponent = (pathname && routeSkeletons[pathname]) || DefaultSkeleton
  return <SkeletonComponent />
}
