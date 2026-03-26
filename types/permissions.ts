/**
 * 按钮等业务权限码（前后端共用）
 */
export const BTN = {
  用户管理: {
    新建: 'btn:user:create',
    编辑: 'btn:user:edit',
    删除: 'btn:user:delete',
  },
  角色管理: {
    新建: 'btn:role:create',
    编辑: 'btn:role:edit',
    删除: 'btn:role:delete',
  },
} as const

type FlattenBtnValues<T> = T extends string ? T : { [K in keyof T]: FlattenBtnValues<T[K]> }[keyof T]

/** 当前已注册的按钮权限码联合类型 */
export type BtnPermissionCode = FlattenBtnValues<typeof BTN>
