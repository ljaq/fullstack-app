import { createContext, useContext, useEffect, useMemo, useState } from 'react'

interface LayoutState {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void

  isMobile: boolean
}

const LayoutContext = createContext<LayoutState>({} as LayoutState)

export const useLayoutState = () => useContext(LayoutContext)

export const LayoutProvider = (props: { children: React.ReactNode }) => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

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

  return (
    <LayoutContext.Provider
      value={useMemo(() => ({ collapsed, isMobile, setCollapsed }), [collapsed, isMobile, setCollapsed])}
    >
      {props.children}
    </LayoutContext.Provider>
  )
}
