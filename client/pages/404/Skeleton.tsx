/**
 * 404 页骨架屏：简单居中
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
      <div style={{ textAlign: 'center', padding: 40 }}>
        <div className="ant-skeleton-title" style={{ width: 200, height: 32, margin: '0 auto' }} />
        <ul className="ant-skeleton-paragraph" style={{ marginTop: 24 }}>
          <li style={{ width: 160, margin: '8px auto' }} />
          <li style={{ width: 120, margin: '8px auto' }} />
        </ul>
      </div>
    </div>
  )
}
