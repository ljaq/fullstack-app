export interface IEnumConfig {
  [key: string]: string | number | { label: string; value: string | number; [key: string | number]: string | number }
}

// 提取所有 value 的联合类型
export type ExtractEnumValue<T> = T[keyof T] extends infer U
  ? U extends { value: infer V }
    ? V
    : U extends string | number
      ? U
      : never
  : never

// 提取所有 label 的联合类型
export type ExtractEnumLabel<T> = T[keyof T] extends infer U
  ? U extends { label: infer V }
    ? V
    : U extends string | number
      ? keyof T
      : never
  : never

export type EnumValue<T extends IEnumConfig> = ExtractEnumValue<T>
export type EnumLabel<T extends IEnumConfig> = ExtractEnumLabel<T>
export type EnumKey<T extends IEnumConfig> = keyof T
