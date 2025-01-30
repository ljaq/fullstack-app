import { getBaseRequest } from '../../api/utils'
import { IFile } from './type'

// 兼容支持 带域名的全量地址
export const compatibleOrigin = (str: string) => {
  return /^[http://|https://]/.test(str) ? str.split('fileName=')[1] : str
}

export const getFileBuffer = async (file: IFile) => {
  if (typeof file === 'string') {
    return getBaseRequest({
      url: file,
      method: 'GET',
      responseType: 'arraybuffer',
    } as any)
  }
  if (file instanceof File) {
    return new Promise(resolve => {
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)
      reader.onloadend = () => {
        resolve(reader.result)
      }
    })
  }
  if (file instanceof ArrayBuffer) return file
}

export const getFileUrl = async (file: IFile, type?: string) => {
  const typeMap: any = {
    pdf: 'application/pdf;chartset=UTF-8',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
  }
  let _file: any
  if (typeof file === 'string') {
    _file = await getBaseRequest({
      url: file,
      method: 'GET',
      responseType: 'arraybuffer',
    } as any)
  } else {
    _file = file
  }
  const blob = new Blob([_file], type && typeMap[type] && { type: typeMap[type] })
  return URL.createObjectURL(blob)
}

export const downloadFile = async (file: IFile, fileType?: string) => {
  const url = await getFileUrl(file)
  const link = document.createElement('a')
  let fileName = ''
  if (typeof file === 'string') {
    fileName = file.split(/_[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}_/).pop() || ''
  } else if (file instanceof ArrayBuffer) {
    fileName = `${url.toString().split('/').pop()}.${fileType}`
  } else {
    fileName = file.name
  }
  link.href = url
  link.download = fileName
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
