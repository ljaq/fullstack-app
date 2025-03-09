import { ApiFilled, LayoutFilled } from '@ant-design/icons'
import { ReactQueryDevtoolsPanel } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtoolsPanel } from '@tanstack/router-devtools'
import { Button, Drawer, Space } from 'antd'
import { Fragment, useState } from 'react'

export default function TanstackDevTools() {
  if (import.meta.env.PROD) return null

  const [showQuery, setShowQuery] = useState(false)
  const [showRouter, setShowRouter] = useState(false)

  return (
    <Fragment>
      <Space
        style={{
          position: 'fixed',
          bottom: showQuery || showRouter ? 448 : 16,
          right: 16,
          zIndex: 9999,
          transition: 'all .3s',
        }}
      >
        <Button
          onClick={() => {
            setShowRouter(!showRouter)
            setShowQuery(false)
          }}
          color='default'
          variant='solid'
          icon={<LayoutFilled />}
        >
          Router
        </Button>
        <Button
          onClick={() => {
            setShowQuery(!showQuery)
            setShowRouter(false)
          }}
          color='default'
          variant='solid'
          icon={<ApiFilled />}
        >
          Query
        </Button>
      </Space>

      <Drawer
        open={showRouter}
        onClose={() => setShowRouter(false)}
        placement='bottom'
        closeIcon={false}
        styles={{ body: { padding: 0 }, mask: { backgroundColor: 'transparent' } }}
        height={432}
        maskClosable
      >
        <TanStackRouterDevtoolsPanel setIsOpen={setShowRouter} style={{ height: 400, padding: 16 }} />
      </Drawer>
      <Drawer
        open={showQuery}
        onClose={() => setShowQuery(false)}
        placement='bottom'
        closeIcon={false}
        styles={{ body: { padding: 0 }, mask: { backgroundColor: 'transparent' } }}
        height={432}
        maskClosable
      >
        <ReactQueryDevtoolsPanel onClose={() => setShowQuery(false)} style={{ height: 432 }} />
      </Drawer>
    </Fragment>
  )
}
