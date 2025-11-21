import { useEffect, useRef, useState } from 'react'
import { renderAsync } from 'docx-preview'
import { Spin } from 'antd'
import { getFileBuffer } from '../utils'
import { IFile } from '../type'

export default function Doc({ file }: { file: IFile }) {
  const [fileBuffer, setFileBuffer] = useState<any>()
  const [loading, setLoading] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true)
    getFileBuffer(file)
      .then(setFileBuffer)
      .finally(() => setLoading(false))
  }, [file])

  useEffect(() => {
    fileBuffer && renderAsync(fileBuffer, ref.current!)
  }, [fileBuffer])

  return (
    <Spin spinning={loading} size='large'>
      <div id='doc-preview' ref={ref} />
    </Spin>
  )
}
