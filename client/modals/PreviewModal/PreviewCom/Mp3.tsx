import { useEffect, useState } from 'react'
import { compatibleOrigin, getFileUrl } from '../utils'
import { IFile } from '../type'

export default function Mp3({ file }: { file: IFile }) {
  const [fileUrl, setFileUrl] = useState('')

  useEffect(() => {
    getFileUrl(file, 'mp3').then(setFileUrl)
  }, [file])

  return <audio controls id='audio-preview' autoPlay src={fileUrl} />
}
