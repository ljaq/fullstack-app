import React from 'react'

export interface IRequest<T = any> {
  data: T
  success: boolean
  message: string
  total?: number
}

export interface IPageConfig {
  icon?: React.ReactNode
  name: string
  order?: number
  authority?: string[]
}
