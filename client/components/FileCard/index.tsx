import { FC, Fragment, useMemo } from 'react'
import { DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { Button, Progress, Spin, theme, UploadFile } from 'antd'
import EasyModal from '../../utils/easyModal'
import PreviewModal from '../../modals/PreviewModal'
import icon_word from './icon/word.png'
import icon_audio from './icon/audio.png'
import icon_excel from './icon/excel.png'
import icon_file from './icon/file.png'
import icon_image from './icon/image.png'
import icon_pdf from './icon/pdf.png'
import icon_video from './icon/video.png'

import './style.less'

interface IProps extends UploadFile {
  onRemove?: () => void
}

const FileCard: FC<IProps> = props => {
  const { name, percent, status, onRemove, response, originFileObj } = props
  const { token } = theme.useToken()
  const isImg = useMemo(() => /\.(jpg|jpeg|png|gif|bmp|webp)$/.test(name), [name])

  const fileIcon = useMemo(() => {
    if (/\.(mp3)$/.test(name)) return icon_audio
    if (/\.(doc|docx)$/.test(name)) return icon_word
    if (/\.(xls|xlsx)$/.test(name)) return icon_excel
    if (/\.(pdf)$/.test(name)) return icon_pdf
    if (/\.(mp4)$/.test(name)) return icon_video
    if (/\.(jpg|jpeg|png|gif|bmp|webp)$/.test(name)) return originFileObj?.arrayBuffer ?? response
    else return icon_file
  }, [name, originFileObj, response])

  return (
    <div
      className='file-card'
      style={{ borderRadius: token.borderRadius }}
      onClick={() => {
        if (originFileObj || response) {
          EasyModal.show(PreviewModal, { file: originFileObj || response })
        }
      }}
    >
      <div className='file-card-name'>
        <div className='file-card-icon'>
          {status === 'uploading' ? (
            <Fragment>
              <Spin size='small' />
              <Progress
                size={['100%', 2]}
                showInfo={false}
                percent={percent}
                strokeColor={token.colorPrimary}
                style={{ position: 'absolute', left: 0, right: 0, bottom: -6 }}
              />
            </Fragment>
          ) : (
            <img src={fileIcon} />
          )}
        </div>
        <div className='ellipsis'>{name}</div>
      </div>
      {onRemove ? (
        <Button
          size='small'
          type='text'
          onClick={e => {
            e.stopPropagation()
            onRemove()
          }}
          icon={<DeleteOutlined className='del' />}
        />
      ) : (
        <Button size='small' type='text' icon={<EyeOutlined className='eye' />} />
      )}
    </div>
  )
}

export default FileCard
