import { MenuOutlined } from '@ant-design/icons'
import { Badge, Button, Popover, Space, theme, Typography } from 'antd'
import { Fragment } from 'react'
import { useLayoutState } from './context'
import { useStyle } from './style'
import { themeList } from './conf'
import { useUser } from 'client/contexts/useUser'
import Breadcrumb from './Breadcrumb'

export default function Header() {
  const [, { setThemeConfig }] = useUser()
  const { collapsed, setCollapsed, isMobile } = useLayoutState()
  const { styles, cx } = useStyle()
  const { colorPrimary } = theme.useToken().token

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
            // <Button
            //   icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            //   type='text'
            //   onClick={() => setCollapsed(!collapsed)}
            // />
            <Typography.Text type='secondary'>当前位置：</Typography.Text>
          )}
          <Breadcrumb />
        </Space>
        <Popover
          arrow={false}
          content={
            <Space style={{ width: 154 }} wrap>
              {themeList.map(color => (
                <Button
                  key={color}
                  type='text'
                  size='small'
                  icon={<Badge dot status={colorPrimary === color ? 'processing' : 'default'} color={color} />}
                  onClick={() => setThemeConfig({ color })}
                />
              ))}
            </Space>
          }
          placement='bottomRight'
        >
          <Badge dot status='processing' color={colorPrimary} />
        </Popover>
      </div>
    </Fragment>
  )
}
