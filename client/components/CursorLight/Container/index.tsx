import { createContext, useCallback, useMemo, useState } from 'react'
import './style.css'

const defaultContext = {
  mouseX: -80,
  mouseY: -80,
  size: 80,
  color: '255, 255, 255',
}

export const CursorLightContext = createContext(defaultContext)

const Container = ({ size = defaultContext.size, color = defaultContext.color, children }) => {
  const [mouseX, setMouseX] = useState(-size)
  const [mouseY, setMouseY] = useState(-size)

  const handleMouseMove = useCallback(e => {
    setMouseX(e.clientX)
    setMouseY(e.clientY)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setMouseX(-size)
    setMouseY(-size)
  }, [size])

  const contextValue = useMemo(
    () => ({
      mouseX,
      mouseY,
      size,
      color,
    }),
    [mouseX, mouseY, size, color],
  )

  return (
    <CursorLightContext.Provider value={contextValue}>
      <div className='cursor-light-container' onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
        {children}
      </div>
    </CursorLightContext.Provider>
  )
}

export default Container
