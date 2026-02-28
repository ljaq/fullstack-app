import fs from 'fs'
import path from 'path'
import { minimatch } from 'minimatch'

export interface IRouteItem {
  name: string
  route: string
  type: 'dynamic' | 'static' | 'catch-all' | 'optional-catch-all'
  path: string
  param?: string
  segment: string
  filePath: string
  children?: IRouteItem[]
}

// 默认忽略模式（可根据需要修改）
const DEFAULT_IGNORE_PATTERNS = [
  '**/components/*.tsx',
  '**/components/*.ts',
  '**/schema.ts',
  '**/style.ts',
  '**/*.config.tsx',
  '**/*.config.ts',
]

/**
 * 解析文件名或目录名，返回类型、参数名和路由片段（segment）
 */
function parseSegment(name) {
  const baseName = path.basename(name, path.extname(name))
  if (baseName === 'index') return { type: 'index', segment: '' }
  const dynamicMatch = baseName.match(/^\[([^[.]+)\]$/)
  if (dynamicMatch) {
    const param = dynamicMatch[1]
    return { type: 'dynamic', param, segment: `:${param}` }
  }
  const catchAllMatch = baseName.match(/^\[\.\.\.([^[.]+)\]$/)
  if (catchAllMatch) {
    const param = catchAllMatch[1]
    return { type: 'catch-all', param, segment: `:${param}*` }
  }
  const optionalCatchAllMatch = baseName.match(/^\[\[\.\.\.([^[.]+)\]\]$/)
  if (optionalCatchAllMatch) {
    const param = optionalCatchAllMatch[1]
    return { type: 'optional-catch-all', param, segment: `:${param}?` }
  }
  return { type: 'static', segment: baseName }
}

/**
 * 判断文件是否为 Next.js 页面文件
 */
function isPageFile(fileName) {
  const validExt = ['.js', '.jsx', '.ts', '.tsx', '.mjs']
  const ext = path.extname(fileName)
  const baseName = path.basename(fileName, ext)
  if (baseName.startsWith('_')) return false
  if (['_app', '_document', '_error'].includes(baseName)) return false
  return validExt.includes(ext)
}

/**
 * 检查文件相对路径是否匹配任意忽略模式
 */
function isIgnored(relativePath, ignorePatterns) {
  return ignorePatterns.some(pattern => minimatch(relativePath, pattern))
}

/**
 * 递归扫描 pages 目录
 * @param {string} dirPath - 当前目录绝对路径
 * @param {string} parentRoute - 父级路由
 * @param {string} parentPath - 相对 pages 的路径
 * @param {Array} flatList - 扁平路由列表（引用传递）
 * @param {Array} ignorePatterns - 忽略模式列表
 * @returns {Array} 树状节点数组
 */
function scanPagesDir(dirPath, parentRoute = '', parentPath = '', flatList = [], ignorePatterns = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })
  const children = []

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    const relativePath = parentPath ? path.join(parentPath, entry.name) : entry.name

    // 忽略以下划线开头的文件和目录
    if (entry.name.startsWith('_')) continue

    const { type, param, segment } = parseSegment(entry.name)
    const routeName = [...parentRoute.split('/'), segment].filter(Boolean).map(r => r.replace(/:/g, '')).join('_')

    if (entry.isDirectory()) {
      const dirNode = {
        name: routeName,
        segment,
        type,
        ...(param && { param }),
        children: [],
      }

      const subRoute = parentRoute ? `${parentRoute}/${segment}` : `/${segment}`
      dirNode.children = scanPagesDir(fullPath, subRoute, relativePath, flatList, ignorePatterns)
      children.push(dirNode)
    } else if (entry.isFile() && isPageFile(entry.name)) {
      // 检查是否被忽略模式排除
      if (isIgnored(relativePath, ignorePatterns)) continue

      let route
      if (type === 'index') {
        route = parentRoute || '/'
      } else {
        route = parentRoute ? `${parentRoute}/${segment}` : `/${segment}`
      }

      const fileNode = {
        name: routeName,
        segment,
        type,
        ...(param && { param }),
        route,
        path: fullPath,
        children: [],
      }
      children.push(fileNode)

      flatList.push({
        name: routeName,
        route,
        type,
        param,
        segment,
        filePath: fullPath,
      })
    }
  }

  return children
}

/**
 * 主函数：生成树状和扁平路由信息
 * @param {string} pagesDir - pages 文件夹的绝对路径
 * @param {Array} ignorePatterns - 忽略模式列表（默认使用 DEFAULT_IGNORE_PATTERNS）
 * @returns {{ tree: Array, flatRoutes: Array }}
 */
export default function fileBaseRoutes(
  pagesDir,
  ignorePatterns = DEFAULT_IGNORE_PATTERNS,
): { tree: IRouteItem[]; flatRoutes: IRouteItem[] } {
  const flatRoutes = []
  const tree = scanPagesDir(pagesDir, '', '', flatRoutes, ignorePatterns)
  return { tree, flatRoutes }
}

// ========== 使用示例 ==========
// const pagesDir = path.resolve(process.cwd(), 'client/pages/cms/routes');
// const result = generateRouteInfo(pagesDir);
// console.log(JSON.stringify(result, null, 2));
