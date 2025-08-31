import { useQuery } from '@tanstack/react-query'
import { Divider, Pagination, Select, SelectProps, Spin } from 'antd'
import { Fetch } from 'client/api/utils'
import { debounce } from 'client/utils'
import { useMemo, useState } from 'react'

interface IProps extends SelectProps {
  url: string
  labelKey: string
  valueKey: string
  searchKey?: string
  baseQuery?: Record<string, any>
}

export default function PageSelector(props: IProps) {
  const { url, labelKey, valueKey, searchKey = '', baseQuery = {}, ...rest } = props
  const [searchVal, setSearchval] = useState('')
  const [pageInfo, setPageInfo] = useState({ page: 1, page_size: 10 })

  const { data, isLoading, refetch } = useQuery({
    queryKey: [pageInfo, searchVal, baseQuery],
    retry: 1,
    placeholderData: prevData => prevData,
    queryFn: () => {
      const query = { ...pageInfo, ...baseQuery, [searchKey]: searchVal }
      if (searchKey) {
        query[searchKey] = searchVal
      }
      return Fetch({ url, method: 'GET', query })
    },
  })
  const total = useMemo(() => data?.total || 0, [data])
  const options = useMemo(() => {
    return data?.data.map(item => ({ label: item[labelKey], value: item[valueKey], originData: item })) || []
  }, [data])

  return (
    <Select
      {...rest}
      showSearch={!!searchKey}
      filterOption={false}
      onSearch={debounce(val => setSearchval(val), 500)}
      options={options}
      popupRender={menu => (
        <Spin spinning={isLoading}>
          {menu}
          {options.length > 0 && (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ paddingBottom: 12 }}>
                <Pagination
                  simple
                  size='small'
                  total={total}
                  current={pageInfo.page}
                  pageSize={pageInfo.page_size}
                  onChange={(page, size) => {
                    setPageInfo({ page, page_size: size })
                  }}
                />
              </div>
            </>
          )}
        </Spin>
      )}
    />
  )
}
