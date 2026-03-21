import { MenuFoldOutlined, MenuOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import { Button, Space, Typography } from 'antd'
import { Fragment } from 'react'
import { useLayoutState } from './context'
import { useStyle } from './style'
import Breadcrumb from './Breadcrumb'

export default function Header() {
  const { collapsed, setCollapsed, isMobile } = useLayoutState()
  const { styles, cx } = useStyle()

  return (
    <Fragment>
      {isMobile && (
        <div className={styles.logo}>
          <Button icon={<MenuOutlined />} type='text' onClick={() => setCollapsed(!collapsed)} />
          <img src='/logo.svg' style={{ marginLeft: 8 }} />
        </div>
      )}
      <div className={cx(styles.header, isMobile && 'mobile')}>
        <Space>
          {!isMobile && (
            <>
              {/* <Button
                icon={collapsed ? <MenuOutlined /> : <MenuOutlined />}
                type='text'
                onClick={() => setCollapsed(!collapsed)}
              /> */}
              <Typography.Text type='secondary'>当前位置：</Typography.Text>
            </>
          )}
          <Breadcrumb />
        </Space>
      </div>
    </Fragment>
  )
}
