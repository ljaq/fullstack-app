import { UploadOutlined } from '@ant-design/icons'
import { Button, GetProps, Upload, UploadFile } from 'antd'
import ImgCrop from 'antd-img-crop'
import { UploadChangeParam } from 'antd/es/upload'
import FileCard from '../FileCard'
import { useUploadConfig } from '../../hooks/useUploadConfig'
import { useEffect, useMemo, useState } from 'react'
import { formatRcFile, getFileUrl } from '../../utils/file'

type IValue = string | string[]

export type CommonUploadProps = GetProps<typeof Upload> & {
  value?: IValue
  onChange?: (val?: IValue) => void
  aspect?: number
  text?: string
}

export default function CommonUpload(props: CommonUploadProps) {
  const { value, onChange, aspect, maxCount = 1, text, ...reset } = props
  const [file, _setFile] = useState<UploadChangeParam<UploadFile>>()
  const uploadConfig = useUploadConfig()

  const children = useMemo(() => {
    const defaultChildren = (
      <Button style={{ width: '100%', justifyContent: 'flex-start' }}>
        <UploadOutlined /> {text || '上传'}
      </Button>
    )
    if (maxCount === 1 && !value) return props.children || defaultChildren
    if (maxCount > 1 && (value?.length || 0) < maxCount) return props.children || defaultChildren
    return null
  }, [props.children, value, maxCount])

  useEffect(() => {
    if (value) _setFile(formatRcFile(value))
  }, [value])

  const uplaod = (
    <Upload
      {...uploadConfig}
      {...reset}
      fileList={file?.fileList}
      style={{ display: 'block' }}
      onChange={e => {
        _setFile(e)
        if (e?.fileList?.every(item => item.status !== 'uploading')) {
          const newVal = getFileUrl(e)
          const _value = maxCount === 1 ? newVal[newVal.length - 1] : newVal.slice(-maxCount)
          onChange?.(_value)
          _setFile(formatRcFile(_value))
        }
      }}
      itemRender={(_, file, fileList, { remove }) => {
        const index = fileList.findIndex(item => item.uid === file.uid)
        return (
          <div className='content-file' style={{ marginTop: !children && index === 0 ? 0 : 8 }}>
            <FileCard {...file} onRemove={remove} />
          </div>
        )
      }}
      children={children}
    ></Upload>
  )

  return aspect ? (
    <ImgCrop fillColor='#00000000' rotationSlider aspect={aspect}>
      {uplaod}
    </ImgCrop>
  ) : (
    uplaod
  )
}
