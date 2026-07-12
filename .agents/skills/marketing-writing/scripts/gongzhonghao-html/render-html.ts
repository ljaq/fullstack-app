import { inline } from './styles'
import {
  escapeAttr,
  parseInline,
  type Block,
  type ParsedArticle,
} from './parse-md'

const textStyles = { strong: inline.strong, em: inline.em }

function inlineText(text: string): string {
  return parseInline(text, textStyles)
}

function renderBlock(block: Block): string {
  switch (block.type) {
    case 'h1':
      return ''
    case 'h2':
      return (
        `<section style="${inline.h2Wrap}">` +
        `<h2 style="${inline.h2}">${inlineText(block.text)}</h2>` +
        `</section>`
      )
    case 'p': {
      const html = inlineText(block.text).replace(/\n/g, '<br/>')
      return `<p style="${inline.p}">${html}</p>`
    }
    case 'hr':
      return `<hr style="${inline.hr}"/>`
    case 'img':
      return (
        `<img src="${escapeAttr(block.src)}" alt="${escapeAttr(block.alt)}" style="${inline.img}"/>`
      )
    case 'blockquote': {
      const inner = block.lines
        .map((line, idx) => {
          const style =
            idx === block.lines.length - 1 ? inline.blockquotePLast : inline.blockquoteP
          return `<p style="${style}">${inlineText(line)}</p>`
        })
        .join('')
      return `<blockquote style="${inline.blockquote}">${inner}</blockquote>`
    }
    case 'ul': {
      const items = block.items
        .map(item => `<li style="${inline.li}">${inlineText(item)}</li>`)
        .join('')
      return `<ul style="${inline.ul}">${items}</ul>`
    }
    default:
      return ''
  }
}

export function renderFragment(parsed: ParsedArticle): string {
  const body = parsed.blocks.map(renderBlock).join('\n')
  return `<!-- 出门玩儿公众号排版 · 复制以下内容到微信公众平台编辑器 -->\n<section style="${inline.article}">\n${body}\n</section>\n`
}
