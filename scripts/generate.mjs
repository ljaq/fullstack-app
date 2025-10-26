#!/usr/bin/env node

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import artTemplate from 'art-template'

dotenv.config({ path: '.env.development' })
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = join(__dirname, '..')
const templatesDir = join(__dirname, 'templates')

// 获取端口号
function getPort() {
  return process.env.VITE_PORT || '5173'
}

// 工具函数
function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function replaceTemplateVars(template, vars) {
  let result = template
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
  }
  return result
}

function ensureDirExists(dirPath) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
  }
}

// 生成有效的组件名称（移除斜杠）
function generateComponentName(routeName) {
  const parts = routeName.split('/')
  return parts
    .map(part => {
      if (part === 'index') {
        return 'Index'
      }
      return capitalizeFirst(part)
    })
    .join('')
}

// 页面生成功能
function generatePage(pageName) {
  const pageDir = join(projectRoot, 'client', 'pages', pageName)

  console.log(`🚀 开始生成页面: ${pageName}`)

  // 检查页面是否已存在
  if (existsSync(pageDir)) {
    console.error(`❌ 页面 ${pageName} 已存在`)
    process.exit(1)
  }

  // 创建目录结构
  ensureDirExists(pageDir)

  // 模板变量
  const templateVars = {
    pageName,
    pageTitle: capitalizeFirst(pageName),
  }

  try {
    // 生成 App.tsx
    writeFileSync(join(pageDir, 'App.tsx'), artTemplate(join(templatesDir, 'App.tpl'), templateVars))

    // 生成 main.tsx
    writeFileSync(join(pageDir, 'main.tsx'), artTemplate(join(templatesDir, 'main.tpl'), templateVars))

    // 生成 index.html
    writeFileSync(join(pageDir, 'index.html'), artTemplate(join(templatesDir, 'index.tpl'), templateVars))

    // 生成 index.less (空文件)
    writeFileSync(join(pageDir, 'index.less'), '')

    console.log(`✅ 页面 ${pageName} 生成成功！`)
    console.log(`📁 页面目录: ${pageDir}`)
    console.log(`🔗 访问地址: http://localhost:${getPort()}/${pageName}`)
    console.log(`💡 提示: 使用 'yarn generate ${pageName} <路由名称>' 生成路由`)
  } catch (error) {
    console.error(`❌ 生成页面失败: ${error.message}`)
    process.exit(1)
  }
}

// 路由生成功能
function generateRoute(pageName, routeName) {
  const pageDir = join(projectRoot, 'client', 'pages', pageName)
  const routesDir = join(pageDir, 'routes')
  // 解析路由路径和文件名
  const routePath = routeName.includes('/') ? dirname(routeName) : ''
  const fileName = routeName.includes('/') ? routeName.split('/').pop() : routeName
  const routeDir = routePath ? join(routesDir, routePath) : routesDir
  const routeFile = join(routeDir, `${fileName}.tsx`)

  console.log(`🚀 开始为页面 ${pageName} 生成路由: ${routeName}`)

  // 检查页面是否存在
  if (!existsSync(pageDir)) {
    console.error(`❌ 页面 ${pageName} 不存在，请先使用 'yarn generate ${pageName}' 生成页面`)
    process.exit(1)
  }

  // 检查路由是否已存在
  if (existsSync(routeFile)) {
    console.error(`❌ 路由 ${routeName} 已存在`)
    process.exit(1)
  }

  // 创建路由目录（包括多层级）
  ensureDirExists(routeDir)

  // 模板变量
  const templateVars = {
    routeName: generateComponentName(routeName),
  }

  try {
    writeFileSync(routeFile, artTemplate(join(templatesDir, 'route.tpl'), templateVars))

    console.log(`✅ 路由 ${routeName} 生成成功！`)
    console.log(`📁 路由文件: ${routeFile}`)
    console.log(`🔗 访问地址: http://localhost:${getPort()}/${pageName}/${routeName}`)
  } catch (error) {
    console.error(`❌ 生成路由失败: ${error.message}`)
    process.exit(1)
  }
}

// 显示帮助信息
function showHelp() {
  console.log('📖 页面和路由生成工具使用说明:')
  console.log('')
  console.log('用法:')
  console.log(' yarn generate <页面名称>')
  console.log(' yarn generate <页面名称> <路由名称>')
  console.log('')
  console.log('命令:')
  console.log(' <页面名称> - 生成页面')
  console.log(' <页面名称> <路由名称> - 为页面生成路由')
  console.log('')
  console.log('参数:')
  console.log(' 页面名称 - 必需，页面的名称（如: dashboard, profile）')
  console.log(' 路由名称 - 可选，路由的名称，支持多层级（如: a, a/index, a/b/c）')
  console.log('')
  console.log('示例:')
  console.log(' yarn generate dashboard')
  console.log(' yarn generate dashboard overview')
  console.log(' yarn generate dashboard a')
  console.log(' yarn generate dashboard a/index')
  console.log(' yarn generate dashboard a/b/c')
  console.log('')
  console.log('💡 提示:')
  console.log(' - 生成页面后，可以添加第二个参数来生成路由')
  console.log(' - 路由名称支持多层级，会自动创建对应目录结构')
}

// 主函数
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    showHelp()
    process.exit(0)
  }

  const [pageName, routeName] = args

  // 检查页面名称
  if (!pageName) {
    console.error('❌ 请提供页面名称')
    process.exit(1)
  }

  // 如果有路由名称，生成路由；否则生成页面
  if (routeName) {
    generateRoute(pageName, routeName)
  } else {
    generatePage(pageName)
  }
}

main()
