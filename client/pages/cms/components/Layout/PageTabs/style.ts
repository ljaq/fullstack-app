import { createStyles } from 'antd-style'

export const usePageTabsStyle = createStyles(({ token, css }) => ({
  wrap: css`
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
  `,
  scroll: css`
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    overflow-y: visible;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 8px 16px;
    margin: -8px -8px 0;
    flex-wrap: nowrap;
    scrollbar-width: thin;
    &::-webkit-scrollbar {
      height: 0px;
    }
  `,
  tab: css`
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 200px;
    padding: 4px 10px;
    border-radius: ${token.borderRadius}px;
    border: 1px solid transparent;
    background: ${token.colorBgLayout};
    cursor: pointer;
    font-size: 13px;
    color: ${token.colorTextSecondary};
    transition: color 0.2s, border-color 0.2s, background 0.2s;
    user-select: none;
    &:hover {
      color: ${token.colorPrimary};
      background: ${token.colorPrimaryHover};
    }
  `,
  tabActive: css`
    background: ${token.colorPrimaryBg} !important;
  `,
  tabLabel: css`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `,
  tabIcon: css`
    flex-shrink: 0;
    font-size: 14px;
    display: inline-flex;
  `,
  close: css`
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    margin-right: -2px;
    border-radius: 4px;
    color: ${token.colorTextTertiary};
    &:hover {
      color: ${token.colorText};
      background: rgba(0, 0, 0, 0.06);
    }
  `,
  actions: css`
    flex-shrink: 0;
    transform: translateY(-8px);
  `,
}))
