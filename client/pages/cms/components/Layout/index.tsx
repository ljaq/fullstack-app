import { Splitter } from 'antd'
import { Suspense, useEffect, useState } from 'react'
import { useLocation, useNavigate, useNavigation, useOutlet } from 'react-router'
import { LayoutProvider, useLayoutState } from './context'
import Header from './Header'
import PageTabs from './PageTabs'
import Sider from './Sider'
import { useStyle } from './style'
import Bg from './Bg'
import Translate from 'client/components/Animation/Translate'
import { ContentSkeleton } from '../../Skeleton'
function Layout() {
  const outlet = useOutlet()
  const { styles, cx } = useStyle()
  const { collapsed, setCollapsed, isMobile, refreshOutletKey } = useLayoutState()
  const [siderWidth, setSiderWidth] = useState(200)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const navigation = useNavigation()
  const isNavigating = Boolean(navigation.location)

  console.log('isNavigating', isNavigating, navigation)

  const handleSpliterSizeChange = ([size]) => {
    setSiderWidth(size > 128 ? size : 73)
    setCollapsed(size < 128)
  }

  useEffect(() => {
    if (collapsed) {
      setSiderWidth(74)
      setTimeout(() => {
        setSiderWidth(73)
      }, 300)
    } else {
      setSiderWidth(200)
    }
  }, [collapsed])

  useEffect(() => {
    if (pathname === '/cms' || pathname === '/cms/') {
      navigate('/cms/home', { replace: true })
    }
  }, [pathname])

  const pcLayout = (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Bg />
      <Splitter style={{ flex: 1, minHeight: 0 }} onResize={handleSpliterSizeChange}>
        <Splitter.Panel size={siderWidth} defaultSize={200} min={73} max={360} style={{ overflow: 'hidden' }}>
          <Sider />
        </Splitter.Panel>
        <Splitter.Panel style={{ overflow: 'hidden', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div className={styles.mainColumn}>
            <Header />
            <PageTabs />
            <div className={styles.contentScroll}>
              <Translate distance={40}>
                <Suspense key={`${pathname}-${refreshOutletKey}`} fallback={<ContentSkeleton />}>
                  <div className={styles.content}>{outlet}</div>
                </Suspense>
              </Translate>
            </div>
          </div>
        </Splitter.Panel>
      </Splitter>
    </div>
  )

  const mobileLayout = (
    <div
      style={{
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Sider />
      <Header />
      <PageTabs />
      <div className={styles.contentScroll} style={{ flex: 1, minHeight: 0 }}>
        <Suspense fallback={<ContentSkeleton />}>
          <Translate distance={40}>
            <div key={`${pathname}-${refreshOutletKey}`} className={styles.content}>
              {outlet}
            </div>
          </Translate>
        </Suspense>
      </div>
    </div>
  )

  return <div className={cx(styles.layout, 'layout')}>{isMobile ? mobileLayout : pcLayout}</div>
}

export default function () {
  return (
    <LayoutProvider>
      <Layout />
    </LayoutProvider>
  )
}
