/**
 * 骨架屏 HTML 生成逻辑，供 Vite 插件与 compileHtml 共用
 * 根据页面名生成对应的 Ant Design Skeleton 结构
 */

const SKELETON_CSS = `
.ant-skeleton { display: block; }
.ant-skeleton-content { padding-top: 16px; }
.ant-skeleton-title { height: 16px; margin-top: 16px; border-radius: 4px; background: linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.15) 37%,rgba(0,0,0,0.06) 63%); background-size: 400% 100%; animation: skeleton-loading 1.4s ease infinite; }
.ant-skeleton-title:first-child { margin-top: 0; }
.ant-skeleton-paragraph { margin-top: 16px; padding-left: 0; list-style: none; }
.ant-skeleton-paragraph > li { height: 16px; margin-top: 16px; border-radius: 4px; background: linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.15) 37%,rgba(0,0,0,0.06) 63%); background-size: 400% 100%; animation: skeleton-loading 1.4s ease infinite; }
.ant-skeleton-paragraph > li:first-child { margin-top: 0; }
.ant-skeleton-input { height: 32px; border-radius: 6px; background: linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.15) 37%,rgba(0,0,0,0.06) 63%); background-size: 400% 100%; animation: skeleton-loading 1.4s ease infinite; }
.ant-skeleton-button { height: 32px; width: 64px; border-radius: 6px; background: linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.15) 37%,rgba(0,0,0,0.06) 63%); background-size: 400% 100%; animation: skeleton-loading 1.4s ease infinite; }
.ant-skeleton-avatar { border-radius: 4px; background: linear-gradient(90deg,rgba(0,0,0,0.06) 25%,rgba(0,0,0,0.15) 37%,rgba(0,0,0,0.06) 63%); background-size: 400% 100%; animation: skeleton-loading 1.4s ease infinite; }
@keyframes skeleton-loading { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
`

function getCmsSkeleton() {
  return `
    <div style="width:100vw;height:100vh;display:flex;background:linear-gradient(#fff,#f5f5f5 28%)">
      <aside style="width:200px;flex-shrink:0;height:100vh;display:flex;flex-direction:column;border-right:1px solid rgba(0,0,0,0.06)">
        <div style="height:56px;display:flex;align-items:center;padding:0 16px;border-bottom:1px solid rgba(0,0,0,0.06)">
          <div class="ant-skeleton-avatar" style="width:32px;height:32px"></div>
          <div class="ant-skeleton-title" style="width:80px;margin-left:8px;margin-top:0"></div>
        </div>
        <div style="flex:1;padding:8px">
          <div class="ant-skeleton-title" style="width:100%"></div>
          <div class="ant-skeleton-title" style="width:70%"></div>
          <div class="ant-skeleton-title" style="width:90%"></div>
          <div class="ant-skeleton-title" style="width:60%"></div>
        </div>
        <div style="height:56px;padding:0 8px;display:flex;align-items:center">
          <div class="ant-skeleton-avatar" style="width:24px;height:24px"></div>
          <div class="ant-skeleton-title" style="width:48px;margin-left:8px;margin-top:0"></div>
        </div>
      </aside>
      <main style="flex:1;height:100vh;overflow:hidden;display:flex;flex-direction:column">
        <header style="height:56px;flex-shrink:0;display:flex;align-items:center;padding:0 40px;border-bottom:1px solid rgba(0,0,0,0.06)">
          <div class="ant-skeleton-title" style="width:120px;margin-top:0"></div>
          <div class="ant-skeleton-title" style="width:80px;margin-left:16px;margin-top:0"></div>
        </header>
        <div style="flex:1;overflow-y:auto;padding:24px 40px 32px">
          <div style="margin-bottom:16px;display:flex;gap:12px;flex-wrap:wrap">
            <div class="ant-skeleton-input" style="width:160px"></div>
            <div class="ant-skeleton-input" style="width:120px"></div>
            <div class="ant-skeleton-input" style="width:200px"></div>
            <div class="ant-skeleton-button"></div>
          </div>
          <div style="border:1px solid rgba(0,0,0,0.06);border-radius:8px;padding:16px;background:#fff">
            <div style="display:flex;gap:12px;margin-bottom:16px">
              <div class="ant-skeleton-title" style="width:60px;margin-top:0"></div>
              <div class="ant-skeleton-title" style="width:60px;margin-top:0"></div>
              <div class="ant-skeleton-title" style="width:60px;margin-top:0"></div>
            </div>
            <div class="ant-skeleton-paragraph"><li style="width:100%"></li><li style="width:95%"></li><li style="width:98%"></li><li style="width:90%"></li><li style="width:92%"></li></div>
            <div style="margin-top:16px;display:flex;justify-content:space-between;align-items:center">
              <div class="ant-skeleton-title" style="width:80px;margin-top:0"></div>
              <div style="display:flex;gap:8px">
                <div class="ant-skeleton-button" style="width:32px"></div>
                <div class="ant-skeleton-button" style="width:32px"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
}

function getLoginSkeleton() {
  return `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(#fff,#f5f5f5)">
      <div style="width:360px;padding:32px;border:1px solid rgba(0,0,0,0.06);border-radius:8px;background:#fff">
        <div class="ant-skeleton-title" style="width:120px;margin-top:0;height:24px"></div>
        <div class="ant-skeleton-input" style="width:100%;margin-top:24px"></div>
        <div class="ant-skeleton-input" style="width:100%;margin-top:16px"></div>
        <div class="ant-skeleton-button" style="width:100%;height:40px;margin-top:24px"></div>
      </div>
    </div>
  `
}

function get404Skeleton() {
  return `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(#fff,#f5f5f5)">
      <div style="text-align:center;padding:40px">
        <div class="ant-skeleton-title" style="width:200px;height:32px;margin:0 auto"></div>
        <div class="ant-skeleton-paragraph" style="margin-top:24px"><li style="width:160px;margin:8px auto"></li><li style="width:120px;margin:8px auto"></li></div>
      </div>
    </div>
  `
}

function getDefaultSkeleton() {
  return `
    <div style="padding:24px 40px">
      <div class="ant-skeleton"><div class="ant-skeleton-content"><div class="ant-skeleton-title"></div><div class="ant-skeleton-paragraph"><li></li><li></li><li></li><li></li></div></div></div>
      <div class="ant-skeleton" style="margin-top:24px"><div class="ant-skeleton-content"><div class="ant-skeleton-title"></div><div class="ant-skeleton-paragraph"><li></li><li></li><li></li><li></li><li></li><li></li></div></div></div>
    </div>
  `
}

const PAGE_SKELETONS = {
  cms: getCmsSkeleton,
  login: getLoginSkeleton,
  '404': get404Skeleton,
}

export function getSkeletonForPage(pageName) {
  const fn = PAGE_SKELETONS[pageName]
  return fn ? fn() : getDefaultSkeleton()
}

/** 将 HTML 中 #root 内的内容替换为指定页面的骨架屏 */
export function injectSkeleton(html, pageName) {
  if (!pageName) return html
  // 贪婪匹配整个 #root div（含嵌套），兼容源码（</div> 后跟 <script>）与构建后（</div> 后跟 </body>）
  const rootContentRegex = /<div id="root">[\s\S]*<\/div>(?=\s*<script|\s*<\/body>)/m
  const skeleton = getSkeletonForPage(pageName)
  const rootWithSkeleton = `<div id="root">\n      <style>${SKELETON_CSS}</style>\n      ${skeleton.trim()}\n    </div>`
  return html.replace(rootContentRegex, rootWithSkeleton)
}
