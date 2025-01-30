import { Button, Modal, Result, Row, Space } from 'antd'
import EasyModal from '../../utils/easyModal'
import { useCallback, useMemo, useState } from 'react'
import { IFile, FileType, IProps } from './type'
import { downloadFile } from './utils'
import Doc from './PreviewCom/Doc'
import Pdf from './PreviewCom/Pdf'
import Image from './PreviewCom/Image'
import Xls from './PreviewCom/Xls'
import { CloseOutlined, DownloadOutlined, RollbackOutlined } from '@ant-design/icons'

import './style.less'
import Mp3 from './PreviewCom/Mp3'
import Mp4 from './PreviewCom/Mp4'

const PreviewComMap: { [key in FileType]: React.ComponentType<{ file: IFile }> } = {
  docx: Doc,
  xls: Xls,
  xlsx: Xls,
  pdf: Pdf,
  png: Image,
  jpg: Image,
  gif: Image,
  jpeg: Image,
  mp3: Mp3,
  mp4: Mp4,
}

const PreviewModal = EasyModal.create<IProps>(modal => {
  const { open, hide, resolve, props } = modal
  const { file, type } = props
  const [downloadLoading, setDownloadLoading] = useState(false)
  const fileType = useMemo(() => {
    if (type) return type
    if (typeof file === 'string') return file.split('.').pop()?.toLowerCase() as FileType
    if (file instanceof File) return file.name.split('.').pop()?.toLowerCase() as FileType
  }, [type, file])
  const PreviewCom = PreviewComMap[fileType!]

  const handleCancle = useCallback(() => {
    hide()
    resolve()
  }, [hide, resolve])

  const handleDownload = (file: IFile, fileType?: string) => {
    setDownloadLoading(true)
    downloadFile(file, fileType).finally(() => setDownloadLoading(false))
  }

  return (
    <Modal
      destroyOnClose
      className='preview-modal'
      zIndex={1900}
      title={
        <Row justify='end'>
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(file, fileType)}
              type='text'
              loading={downloadLoading}
            />
            <Button icon={<CloseOutlined />} onClick={handleCancle} type='text' />
          </Space>
        </Row>
      }
      open={open}
      footer={null}
      closeIcon={null}
    >
      {PreviewCom ? (
        <PreviewCom file={file} />
      ) : (
        <Result
          status={500}
          title='无法预览此文件'
          extra={
            <Space>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(file, fileType)}
                loading={downloadLoading}
              >
                下载
              </Button>
              <Button type='primary' icon={<RollbackOutlined />} onClick={handleCancle}>
                返回
              </Button>
            </Space>
          }
        />
      )}
    </Modal>
  )
})

export default PreviewModal
