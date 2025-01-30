import { RcFile } from 'antd/lib/upload'

export type FileType = 'docx' | 'xls' | 'xlsx' | 'pdf' | 'png' | 'jpg' | 'gif' | 'jpeg' | 'mp3' | 'mp4'

// string 格式为 no-waste-city_3a0eb475-19cd-e475-cd9b-493ffd98f638_xxxxx.xlsx
export type IFile = string | ArrayBuffer | RcFile

export interface IProps {
  type?: FileType
  file: IFile
}
