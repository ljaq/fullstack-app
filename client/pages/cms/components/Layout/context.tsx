import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

interface LayoutState {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void

  isMobile: boolean

  /** 标签栏：刷新子页面 */
  refreshOutletKey: number
  refreshPage: () => void

  tabs: TabItem[]
  syncTabForPath: (pathname: string, title: string) => void
  togglePin: (path: string) => void
  closeTab: (path: string, activePath: string, navigate: (to: string) => void) => void
  closeLeft: (activePath: string) => void
  closeRight: (activePath: string) => void
  closeOthers: (activePath: string) => void
  closeAll: (activePath: string, navigate: (to: string) => void) => void
}

export interface TabItem {
  path: string
  title: string
  pinned: boolean
}

const STORAGE_KEY = 'cms-page-tabs'

const DEFAULT_HOME_PATH = '/cms/home'

function loadTabs(): TabItem[] | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { tabs?: TabItem[] }
    if (Array.isArray(parsed.tabs) && parsed.tabs.length > 0) return parsed.tabs
  } catch {
    /* ignore */
  }
  return null
}

function persistTabs(tabs: TabItem[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ tabs }))
  } catch {
    /* ignore */
  }
}

function reorderPin(tabs: TabItem[], path: string, pinned: boolean): TabItem[] {
  const target = tabs.find(t => t.path === path)
  if (!target) return tabs
  const rest = tabs.filter(t => t.path !== path)
  const next = { ...target, pinned }
  if (pinned) {
    const pinnedRest = rest.filter(t => t.pinned)
    const unpinnedRest = rest.filter(t => !t.pinned)
    return [...pinnedRest, next, ...unpinnedRest]
  }
  const pinnedRest = rest.filter(t => t.pinned)
  const unpinnedRest = rest.filter(t => !t.pinned)
  return [...pinnedRest, ...unpinnedRest, next]
}

const LayoutContext = createContext<LayoutState>({} as LayoutState)

export const useLayoutState = () => useContext(LayoutContext)

export const LayoutProvider = (props: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [refreshOutletKey, setRefreshOutletKey] = useState(0)
  const [tabs, setTabs] = useState<TabItem[]>(
    () =>
      loadTabs() ?? [
        {
          path: DEFAULT_HOME_PATH,
          title: '工作台',
          pinned: true,
        },
      ],
  )

  useEffect(() => {
    persistTabs(tabs)
  }, [tabs])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const refreshPage = useCallback(() => {
    setRefreshOutletKey(k => k + 1)
  }, [])

  const syncTabForPath = useCallback((pathname: string, title: string) => {
    setTabs(prev => {
      const hit = prev.find(t => t.path === pathname)
      if (hit) {
        if (hit.title === title) return prev
        return prev.map(t => (t.path === pathname ? { ...t, title } : t))
      }
      const pinned = prev.filter(t => t.pinned)
      const unpinned = prev.filter(t => !t.pinned)
      return [...pinned, ...unpinned, { path: pathname, title, pinned: false }]
    })
  }, [])

  const togglePin = useCallback((path: string) => {
    setTabs(prev => {
      const t = prev.find(x => x.path === path)
      if (!t) return prev
      return reorderPin(prev, path, !t.pinned)
    })
  }, [])

  const closeTab = useCallback(
    (path: string, activePath: string, navigate: (to: string) => void) => {
      setTabs(prev => {
        const tab = prev.find(t => t.path === path)
        if (!tab || tab.pinned) return prev
        const idx = prev.findIndex(t => t.path === path)
        const nextList = prev.filter(t => t.path !== path)
        if (activePath === path) {
          const left = prev[idx - 1]
          const right = prev[idx + 1]
          const fallback = left?.path ?? right?.path ?? DEFAULT_HOME_PATH
          queueMicrotask(() => navigate(fallback))
        }
        return nextList
      })
    },
    [],
  )

  const closeLeft = useCallback((activePath: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.path === activePath)
      if (idx <= 0) return prev
      return prev.filter((t, i) => i >= idx || t.pinned)
    })
  }, [])

  const closeRight = useCallback((activePath: string) => {
    setTabs(prev => {
      const idx = prev.findIndex(t => t.path === activePath)
      if (idx < 0 || idx >= prev.length - 1) return prev
      return prev.filter((t, i) => i <= idx || t.pinned)
    })
  }, [])

  const closeOthers = useCallback((activePath: string) => {
    setTabs(prev => prev.filter(t => t.path === activePath || t.pinned))
  }, [])

  const closeAll = useCallback((activePath: string, navigate: (to: string) => void) => {
    setTabs(prev => {
      const kept = prev.filter(t => t.pinned)
      if (kept.length === 0) {
        queueMicrotask(() => navigate(DEFAULT_HOME_PATH))
        return [{ path: DEFAULT_HOME_PATH, title: '工作台', pinned: true }]
      }
      if (!kept.some(t => t.path === activePath)) {
        queueMicrotask(() => navigate(kept[kept.length - 1]?.path ?? DEFAULT_HOME_PATH))
      }
      return kept
    })
  }, [])

  const value = useMemo(
    () => ({
      collapsed,
      setCollapsed,
      isMobile,
      refreshOutletKey,
      refreshPage,
      tabs,
      syncTabForPath,
      togglePin,
      closeTab,
      closeLeft,
      closeRight,
      closeOthers,
      closeAll,
    }),
    [
      collapsed,
      isMobile,
      refreshOutletKey,
      refreshPage,
      tabs,
      syncTabForPath,
      togglePin,
      closeTab,
      closeLeft,
      closeRight,
      closeOthers,
      closeAll,
    ],
  )

  return <LayoutContext.Provider value={value}>{props.children}</LayoutContext.Provider>
}
