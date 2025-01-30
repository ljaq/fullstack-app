import { useEffect, useState } from 'react'
import { compatibleOrigin, getFileUrl } from '../utils'
import { IFile } from '../type'

export default function Mp4({ file }: { file: IFile }) {
  const [fileUrl, setFileUrl] = useState('')

  useEffect(() => {
    getFileUrl(file, 'mp4').then(setFileUrl)
  }, [file])

  return <video controls id='video-preview' autoPlay src={fileUrl} />
}
