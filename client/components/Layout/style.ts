import { createStyles } from 'antd-style'

export const useStyle = createStyles(({ token, css }) => {
  return {
    layout: css`
      display: flex;
      flex-wrap: nowrap;
      background-color: ${token.colorBgLayout};
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
    header: css`
      position: sticky;
      display: flex;
      align-items: center;
      height: 64px;
      padding: 0 40px;
    `,
    content: css`
      padding: 0 40px 32px;
    `,
    sider: css`
      max-width: unset !important;
      min-width: unset !important;
      flex: unset !important;
      padding: 0 8px;
      background-color: transparent;
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
      .ant-menu,
      .ant-menu-sub {
        background-color: transparent !important;
        border: none !important;
      }
    `,
    logo: css`
      display: flex;
      align-items: center;
      font-size: 18px;
      font-weight: 500;
      height: 64px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      white-space: nowrap;
      padding: 0 16px;
      img {
        width: 36px;
        height: 36px;
        margin-right: 4px;
      }
    `,
  }
})
