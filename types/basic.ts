type ClassConstructor<T = any> = {
  // eslint-disable-next-line no-unused-vars
  new (...args: any[]): T
}

type PickValue<T> = Omit<{ [K in keyof T]: T[K] extends { value: infer V } ? V : never }, keyof Enum>

export type EnumValues<T> = PickValue<T>[keyof PickValue<T>]

export class Enum<T = any> {
  /**
   * ## 枚举的值
   */
  value!: T

  /**
   * ## 枚举的描述
   */
  label!: string

  /**
   * ## 实例化创建一个枚举项目
   * @param value 枚举值
   * @param label 枚举描述
   */
  constructor(value: T, label: string) {
    this.value = value
    this.label = label
  }

  /**
   * ## 获取枚举的 `Label`
   * @param value `value`
   * @param defaultLabel `可选` 默认 `-`
   */
  static getLabel(value: number | string, defaultLabel = '-'): string {
    return this.get(value)?.label || defaultLabel
  }

  /**
   * ## 查找一个枚举选项
   * @param value `value`
   */
  static get<E extends Enum>(this: ClassConstructor<E>, value: number | string): E | null {
    return (this as any).toArray().find((item: E) => item.value === value) || null
  }

  /**
   * ## 将枚举转为数组
   * @returns 枚举数组
   */
  // eslint-disable-next-line no-unused-vars
  static toArray<E extends Enum>(this: ClassConstructor<E>): E[] {
    return Object.values(this).filter(item => item instanceof this)
  }

  /**
   * ## 判断 `value` 是否相等
   * @param value `value`
   */
  equalsvalue(value: T): boolean {
    return this.value === value
  }

  /**
   * ## 判断 `value` 是否不相等
   * @param value `value`
   */
  notEqualsvalue(value: T): boolean {
    return this.value !== value
  }
}
