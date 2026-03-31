import { createStyles } from 'antd-style'

export const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      position: relative;
      display: flex;
      flex-wrap: nowrap;
      background: linear-gradient(#ffffff, #f5f5f5 28%);
      .ant-splitter-bar-dragger {
        &::before,
        &::after {
          width: 1px !important;
          background-color: rgba(5, 5, 5, 0.06) !important;
          transition: 0.3s;
        }
        &:hover {
          &::before {
            width: 3px !important;
            background-color: ${token.colorPrimaryHover} !important;
          }
        }
        &:active {
          &::before {
            width: 3px !important;
            background-color: ${token.colorPrimary} !important;
          }
        }
      }
    `,
    /** 主区域：Header + PageTabs 固定高度，仅下方内容滚动 */
    mainColumn: css`
      position: relative;
      z-index: 1;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
      overflow: hidden;
    `,
    contentScroll: css`
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      overflow-x: hidden;
    `,
    header: css`
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
      padding: 0 20px 0 40px;
      &.mobile {
        margin-left: 0px;
      }
    `,
    content: css`
      padding: 0 40px 32px;
    `,
    sider: css`
      max-width: unset !important;
      min-width: unset !important;
      flex: unset !important;
      background-color: transparent;
      height: 100vh;
      .ant-layout-sider-children {
        display: flex;
        flex-direction: column;
      }
      .action {
        position: absolute;
        right: -12px;
        top: 43px;
        width: 24px;
        height: 40px;
        border-radius: 12px;
        background-color: ${token.colorBgLayout};
        z-index: 10;
        transform: translateZ(0);
      }
      .menu {
        flex-grow: 1;
        padding: 0 8px;
        overflow: auto;
      }
      .ant-menu,
      .ant-menu-sub {
        background-color: transparent !important;
        border: none !important;
      }
      .user {
        flex-shrink: 0;
        height: 56px;
        padding: 0 8px;
        user-select: none;
        .user-info {
          padding: 6px 12px;
          border-radius: ${token.borderRadius}px;
          cursor: pointer;
          &:hover {
            background-color: rgba(0, 0, 0, 0.04);
          }
        }
      }
    `,
    logo: css`
      flex-shrink: 0;
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 500;
      height: 56px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      white-space: nowrap;
      padding: 0 16px;
      margin: 0 8px;
      img {
        width: 32px;
        height: 32px;
        margin-right: 4px;
      }
    `,
  }
})
