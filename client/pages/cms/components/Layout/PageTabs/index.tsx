import {
  CloseCircleOutlined,
  CloseOutlined,
  DownOutlined,
  LeftOutlined,
  PushpinOutlined,
  ReloadOutlined,
  RightOutlined,
} from '@ant-design/icons'
import { Button, Dropdown, Typography } from 'antd'
import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useCmsRouteMetaMap } from 'client/pages/cms/components/Layout/flattenCmsRoutes'
import { useLayoutState } from '../context'
import { usePageTabsStyle } from './style'
import Translate from 'client/components/Animation/Translate'

export default function PageTabs() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const metaMap = useCmsRouteMetaMap()
  const {
    tabs,
    syncTabForPath,
    togglePin,
    closeTab,
    closeLeft,
    closeRight,
    closeOthers,
    closeAll,
    refreshPage,
    isMobile,
  } = useLayoutState()
  const { styles, cx } = usePageTabsStyle()

  const titleForPath = useMemo(() => {
    const meta = metaMap.get(pathname)
    if (meta?.name) return meta.name
    const seg = pathname.split('/').filter(Boolean).pop()
    return seg ?? '页面'
  }, [metaMap, pathname])

  useEffect(() => {
    if (!pathname.startsWith('/cms')) return
    if (pathname === '/cms' || pathname === '/cms/') return
    syncTabForPath(pathname, titleForPath)
  }, [pathname, titleForPath, syncTabForPath])

  const buildTabMenuItems = useCallback(
    (forPath: string) => {
      const idx = tabs.findIndex(t => t.path === forPath)
      const tab = tabs.find(t => t.path === forPath)
      const canCloseLeft = idx > 0 && tabs.slice(0, idx).some(t => !t.pinned)
      const canCloseRight =
        idx >= 0 && idx < tabs.length - 1 && tabs.slice(idx + 1).some(t => !t.pinned)
      const canCloseOthers = tabs.some(t => t.path !== forPath && !t.pinned)

      return [
        {
          key: 'refresh',
          icon: <ReloadOutlined />,
          label: '刷新',
          onClick: () => refreshPage(),
        },
        {
          key: 'pin',
          icon: <PushpinOutlined />,
          label: tab?.pinned ? '取消固定' : '固定',
          disabled: !tab,
          onClick: () => tab && togglePin(forPath),
        },
        { type: 'divider' as const },
        {
          key: 'closeLeft',
          icon: <LeftOutlined />,
          label: '关闭左侧',
          disabled: !canCloseLeft,
          onClick: () => closeLeft(forPath, navigate, pathname),
        },
        {
          key: 'closeRight',
          icon: <RightOutlined />,
          label: '关闭右侧',
          disabled: !canCloseRight,
          onClick: () => closeRight(forPath, navigate, pathname),
        },
        {
          key: 'closeOthers',
          icon: <CloseOutlined />,
          label: '关闭其他',
          disabled: !canCloseOthers,
          onClick: () => closeOthers(forPath, navigate, pathname),
        },
        {
          key: 'closeAll',
          icon: <CloseCircleOutlined />,
          label: '关闭全部',
          disabled: tabs.filter(t => !t.pinned).length === 0,
          onClick: () => closeAll(pathname, navigate),
        },
      ]
    },
    [
      closeAll,
      closeLeft,
      closeOthers,
      closeRight,
      navigate,
      pathname,
      refreshPage,
      tabs,
      togglePin,
    ],
  )

  return (
    <div className={styles.wrap} style={{ paddingLeft: isMobile ? 12 : 40, paddingRight: isMobile ? 12 : 40 }}>
      <div className={styles.scroll}>
        {tabs.map(tab => {
          const meta = metaMap.get(tab.path)
          const isActive = tab.path === pathname
          const closable = !tab.pinned
          return (
            <Translate direction='right' distance={40} key={tab.path}>
              <Dropdown menu={{ items: buildTabMenuItems(tab.path) }} trigger={['contextMenu']} placement='bottomLeft'>
                <Button
                  role='tab'
                  className={cx(styles.tab, isActive && styles.tabActive)}
                  onClick={() => {
                    if (tab.path !== pathname) navigate(tab.path)
                  }}
                >
                  {meta?.icon ? <span className={styles.tabIcon}>{meta.icon}</span> : null}
                  <Typography.Text className={styles.tabLabel} ellipsis title={meta?.name ?? tab.title}>
                    {meta?.name ?? tab.title}
                  </Typography.Text>
                  {closable ? (
                    <span
                      className={styles.close}
                      onClick={e => {
                        e.stopPropagation()
                        closeTab(tab.path, pathname, navigate)
                      }}
                    >
                      <CloseOutlined style={{ fontSize: 10 }} />
                    </span>
                  ) : null}
                </Button>
              </Dropdown>
            </Translate>
          )
        })}
      </div>
      <div className={styles.actions}>
        <Dropdown menu={{ items: buildTabMenuItems(pathname) }} trigger={['click']} placement='bottomRight'>
          <Button icon={<DownOutlined />} variant='filled' color='default' />
        </Dropdown>
      </div>
    </div>
  )
}
