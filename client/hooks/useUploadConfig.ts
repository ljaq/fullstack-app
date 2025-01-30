import { App, GetProps, Upload } from 'antd'
import { useMemo } from 'react'
import { useLocalStorage } from 'react-use'

export function useUploadConfig(props?: GetProps<typeof Upload>): GetProps<typeof Upload> {
  const { message } = App.useApp()
  const [token] = useLocalStorage<any>('token')
  const authorization = useMemo(() => `Bearer ${(token as any)?.access_token}`, [token])

  return {
    action: '/api/app/upload-file/upload-file-info',
    headers: { Authorization: authorization },
    ...props,
    beforeUpload(file, fileList) {
      // if (props?.maxCount && fileList.filter(item => item.uid !== file.uid).length >= props.maxCount) {
      //   message.error(`最多上传${props.maxCount}个文件`)
      //   return Upload.LIST_IGNORE
      // }
      const { name } = file
      if (name?.split('.')?.[0]?.length > 50) {
        message.error('超出文件名称字数上限')
        return Upload.LIST_IGNORE
      }
      if (name?.includes(' ')) {
        message.warning('文件名不可包含空格。请修改后上传')
        return Upload.LIST_IGNORE
      }
      return true
    },
  }
}
