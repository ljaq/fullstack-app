import { Splitter } from 'antd'
import { Suspense, useEffect, useState } from 'react'
import { useLocation, useNavigate, useNavigation, useOutlet } from 'react-router'
import { LayoutProvider, useLayoutState } from './context'
import Header from './Header'
import Sider from './Sider'
import { useStyle } from './style'
import Bg from './Bg'
import Translate from 'client/components/Animation/Translate'
import { ContentSkeleton } from '../../Skeleton'
function Layout() {
  const outlet = useOutlet()
  const { styles, cx } = useStyle()
  const { collapsed, setCollapsed, isMobile } = useLayoutState()
  const [siderWidth, setSiderWidth] = useState(200)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  console.log('isNavigating', isNavigating, navigation)


  const handleSpliterSizeChange = ([size]) => {
    setSiderWidth(size > 128 ? size : 66)
    setCollapsed(size < 128)
  }

  useEffect(() => {
    if (collapsed) {
      setSiderWidth(65)
      setTimeout(() => {
        setSiderWidth(66)
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
    <div style={{ width: '100vw', height: '100vh' }}>
      <Bg />
      <Splitter onResize={handleSpliterSizeChange}>
        <Splitter.Panel size={siderWidth} defaultSize={200} min={66} max={360} style={{ overflow: 'hidden' }}>
          <Sider />
        </Splitter.Panel>
        <Splitter.Panel>
          <div style={{ height: '100vh', flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <Header />
            <Suspense fallback={<ContentSkeleton />}>
              <Translate distance={40}>
                <div key={pathname} className={styles.content}>
                  {outlet}
                </div>
              </Translate>
            </Suspense>
          </div>
        </Splitter.Panel>
      </Splitter>
    </div>
  )

  const mobileLayout = (
    <div style={{ width: '100%' }}>
      <Sider />
      <Header />
      <div style={{ height: '100vh', flexGrow: 1 }}>
        <Suspense fallback={<ContentSkeleton />}>
          <Translate distance={40}>
            <div key={pathname} className={styles.content}>
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
