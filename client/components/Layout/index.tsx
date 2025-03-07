import { ReactNode, useEffect, useState } from 'react'
import Header from './Header'
import Sider from './Sider'
import { useStyle } from './style'
import { Splitter } from 'antd'
import { LayoutProvider, useLayoutState } from './context'

interface IProps {
  children: ReactNode
}

function Layout(props: IProps) {
  const { styles, cx } = useStyle()
  const { collapsed, setCollapsed, isMobile } = useLayoutState()
  const [siderWidth, setSiderWidth] = useState(200)

  useEffect(() => {
    if (collapsed) {
      setSiderWidth(65)
      setTimeout(() => {
        setSiderWidth(64)
      }, 300)
    } else {
      setSiderWidth(200)
    }
  }, [collapsed])

  const handleSpliterSizeChange = ([size]) => {
    setSiderWidth(size > 128 ? size : 64)
    setCollapsed(size < 128)
  }

  const pcLayout = (
    <Splitter onResize={handleSpliterSizeChange}>
      <Splitter.Panel size={siderWidth} defaultSize={200} min={64} max={360}>
        <Sider />
      </Splitter.Panel>
      <Splitter.Panel>
        <div style={{ height: '100vh', flexGrow: 1 }}>
          <Header />
          <div className={styles.content}>{props.children}</div>
        </div>
      </Splitter.Panel>
    </Splitter>
  )

  const mobileLayout = (
    <div style={{ width: '100%' }}>
      <Header />
      <div style={{ height: '100vh', flexGrow: 1 }}>
        <div className={styles.content}>{props.children}</div>
      </div>
    </div>
  )

  return <div className={cx(styles.layout)}>{isMobile ? mobileLayout : pcLayout}</div>
}

export default function (props: IProps) {
  return (
    <LayoutProvider>
      <Layout {...props} />
    </LayoutProvider>
  )
}
