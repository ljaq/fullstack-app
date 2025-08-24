export interface IRequest<T = any> {
  data: T
  success: boolean
  message: string
  total?: number
}
