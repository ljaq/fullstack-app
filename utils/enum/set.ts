import { IEnumConfig, EnumKey, EnumLabel, EnumValue } from './type'
import { EnumItem } from './item'

export class EnumSet<T extends IEnumConfig> {
  readonly keys: (keyof T)[]
  readonly values: EnumValue<T>[]
  readonly labels: EnumLabel<T>[]

  private raws: { [key in keyof T]: EnumItem<T> }

  constructor(object: T) {
    this.raws = {} as any
    this.keys = Object.keys(object) as (keyof T)[]
    this.values = []
    this.labels = []
    this.keys.forEach(k => {
      const item = new EnumItem(k, object[k])
      this.raws[k] = item
      this.values.push(item.value)
      this.labels.push(item.label)
      Object.defineProperty(this, k, {
        value: item.value,
        writable: false,
        enumerable: true,
        configurable: false,
      })
    })
  }

  items() {
    return this.keys.map(k => this.raws[k])
  }

  toMenu(): { label: EnumLabel<T>; value: EnumValue<T> }[] {
    return this.keys.map(k => ({
      label: this.raws[k].label,
      value: this.raws[k].value,
    }))
  }

  has(value: EnumValue<T>): boolean {
    return this.values.includes(value)
  }

  label(value: EnumValue<T>): EnumLabel<T> | undefined {
    const found = this.items().find(item => item.value === value)
    return found?.label as EnumLabel<T> | undefined
  }

  key(value: EnumValue<T>): EnumKey<T> | undefined {
    const found = this.items().find(item => item.value === value)
    return found?.key as EnumKey<T> | undefined
  }

  raw(value: EnumValue<T>): EnumItem<T> | undefined {
    return this.items().find(item => item.value === value)
  }

  get valueType(): EnumValue<T> {
    throw new Error('只用于声明value的联合类型，请勿调用！')
  }

  get labelType(): EnumLabel<T> {
    throw new Error('只用于声明label的联合类型，请勿调用！')
  }

  get keyType(): EnumKey<T> {
    throw new Error('只用于声明key的联合类型，请勿调用！')
  }
}
