import { defineConfig } from 'cz-git'

export default defineConfig({
  types: [
    { value: '✨ feat', name: '✨ feat:     新增功能 | A new feature' },
    { value: '🐛 fix', name: '🐛 fix:      修复缺陷 | A bug fix' },
    { value: '📝 docs', name: '📝 docs:     文档更新 | Documentation only changes' },
    { value: '💄 style', name: '💄 style:    代码格式 | Changes that do not affect the meaning of the code' },
    { value: '🔨 refactor', name: '🔨 refactor: 代码重构 | A code change that neither fixes a bug nor adds a feature' },
    { value: '🚀 perf', name: '🚀 perf:     性能提升 | A code change that improves performance' },
    { value: '⚙️ config', name: '⚙️ config:   配置修改 | Configuration files and scripts' },
    { value: '🤔 test', name: '🤔 test:     测试相关 | Adding missing tests or correcting existing tests' },
    { value: '📦️ build', name: '📦️ build:    构建相关 | Build system and dependencies' },
    { value: '🎡 ci', name: '🎡 ci:       持续集成 | Changes to our CI configuration files and scripts' },
    { value: '🚫 revert', name: '🚫 revert:   回退代码 | Revert to a commit' },
    { value: '📁 chore', name: '📁 chore:    其他修改 | Other changes that do not modify src or test files' },
  ],
  // 需求取pages下面的目录、其它为other
  // scopes: ['other', ...scopes],
  messages: {
    type: '选择一种你的提交类型:',
    scope: '选择一个scope (可选):',
    subject: '短说明:',
    confirmCommit: '确定提交commit吗?',
  },
  subjectLimit: 100,
  skipQuestions: ['body', 'breaking', 'footer', 'scope'],
})
