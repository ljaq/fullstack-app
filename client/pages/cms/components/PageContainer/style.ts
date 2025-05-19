import { createStyles } from 'antd-style'

export const useStyle = createStyles(({ token, css }) => {
  return {
    pageContainer: css``,
    header: css`
      margin-bottom: 16px;
      .back {
        color: ${token.colorText};
        &:hover {
          color: ${token.colorTextTertiary};
        }
        &:active {
          color: ${token.colorTextSecondary};
        }
      }
      .title {
        font-size: 20px;
      }
    `,
    footer: css`
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      height: 56px;
      background-color: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
    `,
  }
})
