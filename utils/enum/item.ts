import { IEnumConfig, EnumKey, EnumValue, EnumLabel } from './type'

export class EnumItem<T extends IEnumConfig> {
  key: EnumKey<T>
  label: EnumLabel<T>
  value: EnumValue<T>
  raw: { label: EnumLabel<T>; value: EnumValue<T>; [key: string | number]: any }
  constructor(key: keyof T, raw: T[keyof T]) {
    this.key = key
    if (typeof raw === 'object') {
      this.raw = raw as any
      this.value = raw.value as EnumValue<T>
      this.label = (raw.label as EnumLabel<T>) || key
    } else {
      this.raw = { label: key, value: raw } as any
      this.value = raw as EnumValue<T>
      this.label = key as EnumLabel<T>
    }
  }
}
