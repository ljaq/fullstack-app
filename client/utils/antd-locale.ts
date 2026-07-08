import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import zhCN from 'antd/locale/zh_CN'

/** 与 antd DatePicker / Calendar 等组件一致，需在应用入口执行一次 */
dayjs.locale('zh-cn')

export const antdZhCN = zhCN
export default zhCN
