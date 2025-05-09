import { Splitter } from 'antd'
import { ReactNode, useEffect, useState } from 'react'
import { LayoutProvider, useLayoutState } from './context'
import Header from './Header'
import Sider from './Sider'
import { useStyle } from './style'

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
        setSiderWidth(66)
      }, 300)
    } else {
      setSiderWidth(200)
    }
  }, [collapsed])

  const handleSpliterSizeChange = ([size]) => {
    setSiderWidth(size > 128 ? size : 66)
    setCollapsed(size < 128)
  }

  const pcLayout = (
    <Splitter onResize={handleSpliterSizeChange}>
      <Splitter.Panel size={siderWidth} defaultSize={200} min={66} max={360} style={{ overflow: 'hidden' }}>
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
      <Sider />
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
