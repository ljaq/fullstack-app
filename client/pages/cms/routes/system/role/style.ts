import { createStyles } from 'antd-style'

export const useStyle = createStyles(({ token, css }) => {
  return {
    roleList: css`
      background-color: ${token.colorBgContainer};
      border-radius: ${token.borderRadiusLG}px;
      padding: ${token.paddingSM}px;
      border: 1px solid ${token.colorBorderSecondary};
    `,
    roleItem: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 6px 6px 12px;
      border-radius: ${token.borderRadius}px;
      cursor: pointer;
      &:hover {
        background-color: ${token.colorBgLayout};
      }
      &.active {
        background-color: ${token.colorPrimaryBg};
      }
      &:not(:last-child) {
        margin-bottom: 4px;
      }
    `,
    tree: css`
      .ant-tree-checkbox {
        align-self: flex-start;
        margin-top: 4px !important;
      }
    `,
    treeNodeBlock: css`
      display: block;
      width: 100%;
    `,
    treeNodeTitleText: css`
      display: inline-block;
      line-height: ${token.lineHeight};
    `,
    treeNodeButtons: css`
      display: flex;
      flex-wrap: wrap;
      gap: ${token.marginXS}px ${token.marginSM}px;
      align-items: center;
      margin-top: ${token.marginXXS}px;
      padding-left: 0;
      padding: 4px 8px;
      background-color: ${token.colorBgLayout};
      border-radius: ${token.borderRadius}px;
    `,
  }
})
