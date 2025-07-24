import { ArrowLeftOutlined, LeftOutlined } from '@ant-design/icons'
import { Button, Space } from 'antd'
import { useStyle } from './style'
import { useMemo } from 'react'
import { useLocation } from 'react-router'
import routes from '~react-page-cms'

interface IProps {
  children?: React.ReactNode
  footer?: React.ReactNode
  extra?: React.ReactNode
}

export default function PageContainer(props: IProps) {
  const { children, footer, extra } = props
  const { pathname } = useLocation()
  const { styles } = useStyle()

  const meta = useMemo(() => {
    const paths = pathname.split('/').filter(p => p)

    const walk = (routes: any, index: number) => {
      const cur = routes.find((item: any) => item.path === paths[index])

      if (cur) {
        if (index < paths.length - 1) {
          return walk(cur.children, index + 1)
        }
        return cur
      }
    }
    return walk(routes, 0)?.meta
  }, [pathname])

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <Space size='middle'>
          <a className='back'>
            <ArrowLeftOutlined />
          </a>
          <span className='title'>{meta?.name}</span>
        </Space>
      </div>

      {children}
      {footer && <div className={styles.footer}>{footer}</div>}
    </div>
  )
}
