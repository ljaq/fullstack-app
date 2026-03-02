import path from 'path'
import colors from 'picocolors'
import fs from 'fs'
import dayjs from 'dayjs'

export const FORMAT_CONFIG = { ...JSON.parse(fs.readFileSync(path.join(process.cwd(), '.prettierrc'), 'utf-8')), parser: 'typescript' }
export const logTimeStamp = () => colors.dim(dayjs().format('h:mm:ss A'))
export const hasFile = (filePath: string) => {
  try {
    return fs.existsSync(filePath)
  } catch (e) {
    return false
  }
}
export const handleRemoveAccept = (filePath: string) => filePath.split('.').slice(0, -1).join('.')
