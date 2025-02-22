import { ReactNode } from 'react'
import Header from './Header'
import Sider from './Sider'
import { useStyle } from './style'

interface IProps {
  children: ReactNode
}

export default function (props: IProps) {
  const { styles } = useStyle()

  return (
    <div className={styles.layout}>
      <Sider />
      <div style={{ height: '100vh', flexGrow: 1 }}>
        <Header />
        <div className={styles.content}>{props.children}</div>
      </div>
    </div>
  )
}
