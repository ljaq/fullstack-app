import React, {
  ForwardedRef,
  forwardRef,
  Fragment,
  ReactElement,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react'
import { Card, TableProps, Row, Table, Space, Button, theme, Tooltip, Modal, ConfigProvider } from 'antd'
import { MenuOutlined } from '@ant-design/icons'
import { SorterResult, TableRowSelection } from 'antd/lib/table/interface'
import { useQuery } from '@tanstack/react-query'
import type { DragEndEvent } from '@dnd-kit/core'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Schema, useForm, SearchForm } from 'form-render'
import { useStyle } from './useStyle'
import { API_REQ_FUNCTION } from '../../api/types'

interface IProps {
  tableTitle?: ReactNode
  search?: { schema: Schema }
  request: API_REQ_FUNCTION
  extra?: ReactElement
  ghost?: boolean
  dragable?:
    | boolean
    | {
        request: API_REQ_FUNCTION
      }
  selectable?: boolean
  getSelectProps?: TableRowSelection['getCheckboxProps']
  selectExtra?: ReactNode
  baseQuery?: { [key: string]: any }
  defaultPageSize?: number
  onUpdate?: (data: any[]) => void
}

export type CommonTableProps = TableProps<any> & IProps

export interface CommonTableInstance {
  fetchData: () => Promise<any>
  getTableData: () => any[]
  getSelectedRows: () => any[]
  setSelectedRows: (data: any[]) => void
  getParams: () => {
    query: { [key: string]: any }
    pageInfo: { page: number; size: number }
    sortInfo: [string?, ('asc' | 'desc')?]
  }
  setPageInfo: any
}

const DRAG_KEY = '@drag_key'
export const INDEX_KEY = '@index_key'
const SortRow = ({ children, ...props }: React.HTMLAttributes<HTMLTableRowElement> & { 'data-row-key': string }) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: props['data-row-key'],
  })

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  }

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, child => {
        if ((child as React.ReactElement).key === DRAG_KEY) {
          return React.cloneElement(child as React.ReactElement, {
            children: (
              <MenuOutlined ref={setActivatorNodeRef} style={{ touchAction: 'none', cursor: 'move' }} {...listeners} />
            ),
          })
        }
        return child
      })}
    </tr>
  )
}

function CommonTable(props: CommonTableProps, ref: ForwardedRef<CommonTableInstance>) {
  const {
    search,
    style,
    className,
    request,
    tableTitle,
    extra,
    baseQuery,
    ghost,
    defaultPageSize,
    pagination,
    dragable,
    columns,
    rowKey = 'id',
    onUpdate,
    selectable,
    getSelectProps,
    selectExtra,
    ...reset
  } = props
  const { styles, cx } = useStyle()
  const form = useForm()
  const [pageInfo, setPageInfo] = useState({ page: 1, size: defaultPageSize ?? 10 })
  const [sortInfo, setSortInfo] = useState<[string?, ('asc' | 'desc')?]>([])
  const [filters, setFilters] = useState<any>({})
  const [query, setQuery] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState<any[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [showSelectedModal, setShowSelectedModal] = useState(false)
  const selectedRowKeys = useMemo(() => selectedRows.map(item => item[rowKey as any]), [selectedRows, rowKey])
  const { token } = theme.useToken()

  const { data, isFetching, refetch } = useQuery({
    queryKey: [request.url, pageInfo, query, sortInfo, filters, baseQuery],
    retry: 1,
    placeholderData: prevData => prevData,
    queryFn: () =>
      request({
        method: 'GET',
        query: {
          page: pageInfo.page,
          page_size: pageInfo.size,
          sorting: sortInfo.join(' '),
          ...query,
          ...filters,
          ...baseQuery,
        },
      }),
  })

  const total = useMemo(() => data?.total || 0, [data])

  const fetchData = () => {
    setLoading(true)
    return refetch().finally(() => setLoading(false))
  }

  useEffect(() => {
    setTableData(data?.data || [])
  }, [data])

  useImperativeHandle<unknown, CommonTableInstance>(ref, () => {
    return {
      fetchData,
      getTableData,
      getSelectedRows: () => selectedRows,
      setSelectedRows: setSelectedRows,
      getParams: () => {
        const query = form.getValues()
        return {
          query,
          pageInfo,
          sortInfo,
        }
      },
      setPageInfo: setPageInfo,
    }
  })

  const getTableData = () => {
    return JSON.parse(JSON.stringify(tableData))
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (active.id !== over?.id) {
      const activeIndex = tableData.findIndex(i => i[rowKey.toString()] === active.id)
      const overIndex = tableData.findIndex(i => i[rowKey.toString()] === over?.id)
      setTableData(previous => arrayMove(previous, activeIndex, overIndex))
      if (typeof dragable === 'object') {
        setLoading(true)
        dragable
          .request({
            method: 'POST',
            body: {
              [rowKey.toString()]: active.id,
              dir: overIndex - activeIndex,
            },
          })
          .finally(() => {
            setLoading(false)
          })
      }
    }
  }

  const tableColumns = useMemo(() => {
    const _columns = columns?.map(item => {
      if (item.key !== INDEX_KEY) return item
      return {
        title: '序号',
        width: 70,
        render: (_: any, __: any, index: number) => {
          const { page, size } = pageInfo
          const rank = (page - 1) * size + index + 1
          return <div className={`rank rank-${rank}`}>{rank}</div>
        },
      }
    })
    return dragable && _columns
      ? [{ key: DRAG_KEY, title: '排序', fixed: 'left' as any, width: 60 }, ..._columns]
      : _columns
  }, [columns, dragable, pageInfo])

  const tableCom = (
    <Table
      {...reset}
      rowKey={rowKey}
      loading={isFetching || loading}
      columns={tableColumns}
      dataSource={tableData || []}
      components={dragable ? { body: { row: SortRow } } : undefined}
      rowSelection={
        selectable
          ? {
              selectedRowKeys,
              onChange: (_, rows) => setSelectedRows(rows),
              preserveSelectedRowKeys: true,
              getCheckboxProps: getSelectProps,
            }
          : undefined
      }
      onChange={({ pageSize, current }, filter, sorter) => {
        setFilters(
          Object.keys(filter).reduce((a, b) => {
            const c = (tableColumns as any).find(item => item.dataIndex === b)
            if (c.filterMultiple) {
              a[b] = filter[b]
            } else {
              a[b] = filter[b]?.[0]
            }
            return a
          }, {}),
        )
        const { field, order } = sorter as SorterResult<any>
        if (order) {
          setSortInfo([field?.toString(), order === 'ascend' ? 'asc' : 'desc'])
        } else {
          setSortInfo([])
        }
        setPageInfo({ page: current || 1, size: pageSize || 10 })
      }}
      pagination={
        pagination === false
          ? false
          : {
              total: total ?? 0,
              pageSize: pageInfo.size,
              current: pageInfo.page,
              showTotal: total => `共${total}条`,
              showSizeChanger: true,
              // showQuickJumper: true,
              ...pagination,
            }
      }
    />
  )

  return (
    <Fragment>
      <div className={cx(styles.commonTable, className)} style={style}>
        {search?.schema && (
          <ConfigProvider variant='filled'>
            <SearchForm
              style={{ border: `1px solid ${token.colorBorderSecondary}`, borderRadius: token.borderRadius }}
              form={form}
              schema={search.schema}
              searchOnMount={false}
              onSearch={setQuery}
            />
          </ConfigProvider>
        )}

        <Card style={ghost ? { boxShadow: 'none', border: 'none' } : {}}>
          {(tableTitle || extra) && (
            <Row justify='space-between' align='middle' wrap={false} style={{ marginBottom: token.sizeSM }}>
              <div style={{ fontSize: 16, fontWeight: 'bold' }}>{tableTitle}</div>
              <div>{extra}</div>
            </Row>
          )}
          {selectable && (
            <div className={cx('selected-info', !!selectedRows?.length && 'active')}>
              <Space className='selected-info-text'>
                已选择
                <Tooltip title={selectedRows.length ? '查看已选择' : ''}>
                  <a onClick={() => setShowSelectedModal(!!selectedRows.length)}>{selectedRows.length}</a>
                </Tooltip>
                项
              </Space>
              {selectedRows?.length > 0 && (
                <Space>
                  <Button type='link' size='small' onClick={() => setSelectedRows([])}>
                    取消选择
                  </Button>
                  {selectExtra}
                </Space>
              )}
            </div>
          )}
          {dragable ? (
            <DndContext modifiers={[restrictToVerticalAxis]} onDragEnd={onDragEnd}>
              <SortableContext items={tableData.map(i => i[rowKey.toString()])} strategy={verticalListSortingStrategy}>
                {tableCom}
              </SortableContext>
            </DndContext>
          ) : (
            tableCom
          )}
        </Card>
      </div>

      <Modal
        title='已选择数据'
        footer={null}
        open={showSelectedModal}
        onCancel={() => setShowSelectedModal(false)}
        width='62vw'
      >
        <Table
          columns={columns
            ?.filter(item => item.title !== '操作')
            .map(item => ({ ...item, filters: undefined, filterMultiple: undefined }))}
          dataSource={selectedRows}
          pagination={false}
          scroll={{ x: 'max-content', y: 'calc(100vh - 300px)' }}
        />
      </Modal>
    </Fragment>
  )
}

export default forwardRef(CommonTable)
