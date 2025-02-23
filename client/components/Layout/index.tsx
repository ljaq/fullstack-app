import { ReactNode, useEffect, useState } from 'react'
import Header from './Header'
import Sider from './Sider'
import { useStyle } from './style'
import { Splitter } from 'antd'

interface IProps {
  children: ReactNode
}

export default function (props: IProps) {
  const { styles } = useStyle()
  const [siderWidth, setSiderWidth] = useState(200)
  const [collapsed, setCollapsed] = useState(false)

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

  return (
    <div className={styles.layout}>
      <Splitter onResize={handleSpliterSizeChange}>
        <Splitter.Panel size={siderWidth} defaultSize={200} min={64} max={360}>
          <Sider width={siderWidth} collapsed={collapsed} />
        </Splitter.Panel>
        <Splitter.Panel>
          <div style={{ height: '100vh', flexGrow: 1 }}>
            <Header collapsed={collapsed} setCollapsed={setCollapsed} />
            <div className={styles.content}>{props.children}</div>
          </div>
        </Splitter.Panel>
      </Splitter>
    </div>
  )
}
