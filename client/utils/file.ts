import { UploadFile } from 'antd'
import { RcFile, UploadChangeParam } from 'antd/lib/upload'

export const getFileFromName = (name: string) => {
  return `${import.meta.env.VITE_STATIC_URL}/api/app/blob?fileName=${name}`
}

export function getRcFileUrl(file: RcFile) {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onloadend = () => {
        resolve(reader.result)
      }
    } catch (error) {
      reject(error)
    }
  })
}

export const getFileUrl = (params: UploadChangeParam<UploadFile>) => {
  return params?.fileList?.filter(item => item.status === 'done').map(item => item.response) ?? []
}

export const formatRcFile = (fileUrl?: string[] | string): UploadChangeParam<UploadFile> => {
  const fileList: any[] = (Array.isArray(fileUrl) ? fileUrl : fileUrl ? [fileUrl] : [])
    .map(item =>
      typeof item === 'string'
        ? {
            uid: item,
            fileName: item.split('｜').pop(),
            name: item.split('｜').pop(),
            status: 'done',
            response: item,
            thumbUrl: item,
          }
        : null,
    )
    .filter(v => v)
  return {
    file: fileList[0],
    fileList: fileList,
  }
}

export function downloadFile(blob: Blob, fileName = '未命名') {
  const link = document.createElement('a')
  const binaryData = []
  binaryData.push(blob)
  link.href = window.URL.createObjectURL(new Blob(binaryData))
  link.download = fileName
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
