/**
 * 统一用 art-template 编译 HTML 模板（开发与构建共用）
 * 模板语法：{{if NODE_ENV === 'development'}}...{{/if}}
 */
import template from 'art-template'

export function compileHtml(html, env) {
  return template.render(html, env ?? {})
}
