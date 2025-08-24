import { RouteObject } from 'react-router'
import { Role } from 'types/enum'

export interface IPageConfig {
  icon?: React.ReactNode
  name: string
  order?: number
  authority?: (typeof Role.valueType)[]
}

export type IRouteObject = RouteObject & {
  meta?: IPageConfig
}
