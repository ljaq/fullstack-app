import { createStyles } from 'antd-style'

export const useStyle = createStyles(({ token, css }) => {
  return {
    commonTable: css`
      .rank {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        font-size: 12px;
        background-color: ${token.colorTextQuaternary};
        color: #fff;
        &.rank-1 {
          background-color: ${token.colorTextBase};
        }
        &.rank-2 {
          background-color: ${token.colorTextSecondary};
        }
        &.rank-3 {
          background-color: ${token.colorTextTertiary};
        }
      }
      .selected-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 0;
        padding: 0 ${token.sizeSM}px;
        margin-bottom: 0;
        border-radius: ${token.borderRadius}px;
        background-color: ${token.colorBgLayout};
        overflow: hidden;
        transition: 0.4s;
        &-text {
          color: ${token.colorTextTertiary};
        }
        &.active {
          height: 42px;
          margin-bottom: ${token.sizeSM}px;
        }
      }
    `,
  }
})
