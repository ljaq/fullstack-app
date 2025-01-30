import { useEffect, useState } from 'react'
import { compatibleOrigin, getFileUrl } from '../utils'
import { IFile } from '../type'

export default function Pdf({ file }: { file: IFile }) {
  const [fileUrl, setFileUrl] = useState('')

  useEffect(() => {
    getFileUrl(file, 'pdf').then(setFileUrl)
  }, [file])

  return <iframe id='pdf-preview' src={fileUrl} />
}
