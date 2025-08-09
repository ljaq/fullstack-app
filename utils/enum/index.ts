import { IEnumConfig } from './type'
import { EnumSet } from './set'

type EnumInstance<T extends IEnumConfig> = EnumSet<T> & {
  [K in keyof T]: T[K] extends { value: infer V } ? V : T[K] extends string | number ? T[K] : never
}

export function Enum<T extends IEnumConfig>(object: T): EnumInstance<T> {
  return new EnumSet(object) as EnumInstance<T>
}
