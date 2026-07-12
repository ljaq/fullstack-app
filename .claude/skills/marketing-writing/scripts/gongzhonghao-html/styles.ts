/**
 * 公众号 fragment HTML 样式。
 * 样式变更只改此文件，再运行 md-to-gongzhonghao-html.ts 重新生成。
 */
export const palette = {
  text: '#1a1c1e',
  headingGreen: '#4a6741',
  strongBg: '#c8d8c8',
  paperSecondary: '#f0eeeb',
  divider: '#eeeeee',
  textMuted: '#6b6e76',
} as const

export const fontFamily =
  "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', -apple-system, sans-serif"

export const inline = {
  article:
    'padding: 0 16px; max-width: 677px; margin: 0 auto; font-family: ' +
    fontFamily +
    '; color: ' +
    palette.text +
    ';',
  h2Wrap:
    'margin: 32px 0 20px; padding-bottom: 12px; border-bottom: 1px solid ' +
    palette.divider +
    ';',
  h2:
    'margin: 0; padding-left: 12px; border-left: 5px solid ' +
    palette.headingGreen +
    '; font-size: 20px; font-weight: 700; color: ' +
    palette.headingGreen +
    '; line-height: 1.4;',
  p:
    'font-size: 16px; line-height: 1.85; color: ' +
    palette.text +
    '; margin: 0 0 16px; letter-spacing: 0.02em; text-align: justify;',
  strong:
    'font-weight: 700; color: ' +
    palette.text +
    '; background: linear-gradient(to top, ' +
    palette.strongBg +
    ' 0%, ' +
    palette.strongBg +
    ' 58%, transparent 58%); box-decoration-break: clone; -webkit-box-decoration-break: clone;',
  hr:
    'border: none; height: 1px; background: ' +
    palette.divider +
    '; margin: 28px 0;',
  blockquote:
    'margin: 20px 0; padding: 16px 20px; background: ' +
    palette.paperSecondary +
    '; border-left: 4px solid ' +
    palette.headingGreen +
    '; border-radius: 0 8px 8px 0;',
  blockquoteP:
    'font-size: 15px; line-height: 1.7; color: ' +
    palette.headingGreen +
    '; margin: 0 0 8px;',
  blockquotePLast:
    'font-size: 15px; line-height: 1.7; color: ' +
    palette.headingGreen +
    '; margin: 0;',
  ul: 'margin: 0 0 16px; padding-left: 20px;',
  li:
    'font-size: 16px; line-height: 1.85; color: ' +
    palette.text +
    '; margin-bottom: 8px;',
  img:
    'display: block; width: 100%; max-width: 100%; height: auto; border-radius: 8px; margin: 20px auto;',
  em:
    'font-style: normal; color: ' +
    palette.textMuted +
    '; font-size: 14px; line-height: 1.7;',
} as const
