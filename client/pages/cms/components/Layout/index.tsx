import { Splitter } from 'antd'
import { ReactNode, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { LayoutProvider, useLayoutState } from './context'
import Header from './Header'
import Sider from './Sider'
import { useStyle } from './style'
import Bg from './Bg'

interface IProps {
  children: ReactNode
}

function Layout(props: IProps) {
  const { styles, cx } = useStyle()
  const { collapsed, setCollapsed, isMobile } = useLayoutState()
  const [siderWidth, setSiderWidth] = useState(200)
  const { pathname } = useLocation()
  const navigate = useNavigate()

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
            <div className={styles.content}>{props.children}</div>
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
        <div className={styles.content}>{props.children}</div>
      </div>
    </div>
  )

  return <div className={cx(styles.layout, 'layout')}>{isMobile ? mobileLayout : pcLayout}</div>
}

export default function (props: IProps) {
  return (
    <LayoutProvider>
      <Layout {...props} />
    </LayoutProvider>
  )
}
