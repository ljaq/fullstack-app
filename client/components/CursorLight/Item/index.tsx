import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CursorLightContext } from '../Container/index'

import './style.css'

interface ItemProps {
  className?: string
  size?: number
  color?: string
  light?: boolean
  borderLight?: boolean
  children?: React.ReactNode
  style?: React.CSSProperties
}

const Item = ({ className = '', size, color, light = true, borderLight = true, children, style }: ItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null)
  const { mouseX, mouseY, size: contextSize, color: contextColor } = useContext(CursorLightContext)
  const itemSize = size || contextSize
  const itemColor = color || contextColor

  const [itemStyle, setItemStyle] = useState({
    '--x': `${-itemSize}px`,
    '--y': `${-itemSize}px`,
    '--size': `${itemSize}px`,
    '--mask-x': `${-itemSize * 0.62}px`,
    '--mask-y': `${-itemSize * 0.62}px`,
    '--mask-size': `${itemSize * 0.62}px`,
    '--rotate-x': '0deg',
    '--rotate-y': '0deg',
    '--scale': 1,
    '--light-color': itemColor,
    ...style,
  } as React.CSSProperties)

  const isLight = light // 这里可以根据需要添加loading状态

  const updateStyles = useCallback(() => {
    const rect = itemRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = mouseX - rect.left
    const y = mouseY - rect.top

    const isOver = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height
    const isNear = x >= -itemSize && x <= rect.width + itemSize && y >= -itemSize && y <= rect.height + itemSize

    setItemStyle(prev => ({
      ...prev,
      '--x': `${isLight && isOver ? x : -itemSize}px`,
      '--y': `${isLight && isOver ? y : -itemSize}px`,
      '--size': `${itemSize}px`,
      '--mask-x': `${borderLight && (isOver || isNear) ? x : -0.62 * itemSize}px`,
      '--mask-y': `${borderLight && (isOver || isNear) ? y : -0.62 * itemSize}px`,
      '--mask-size': `${0.62 * itemSize}px`,
      '--light-color': itemColor,
      ...style,
    }))
  }, [mouseX, mouseY, itemSize, isLight, borderLight, itemColor, style])

  useEffect(() => {
    updateStyles()
  }, [updateStyles])

  const handleMouseDown = useCallback(async () => {
    // 等待下一帧确保DOM更新
    await new Promise(resolve => setTimeout(resolve, 0))

    const rect = itemRef.current?.getBoundingClientRect()
    const { width, height } = rect || {}

    if (!width || !height || !rect) return

    const centerX = rect.left + width / 2
    const centerY = rect.top + height / 2

    const offsetX = mouseX - centerX
    const offsetY = mouseY - centerY

    const sizeFactor = Math.min(1, 200 / Math.max(width, height))

    setItemStyle(prev => ({
      ...prev,
      '--rotate-x': `${(-20 * sizeFactor * offsetY) / height}deg`,
      '--rotate-y': `${(20 * sizeFactor * offsetX) / width}deg`,
      '--scale': 1 - sizeFactor * 0.05,
    }))

    // 强制重绘
    if (itemRef.current) {
      itemRef.current.offsetHeight
    }
  }, [mouseX, mouseY])

  const handleMouseUp = useCallback(() => {
    setItemStyle(prev => ({
      ...prev,
      '--rotate-x': '0deg',
      '--rotate-y': '0deg',
      '--scale': 1,
    }))
  }, [])

  return (
    <div
      ref={itemRef}
      className={`cursor-light-item ${className}`}
      style={itemStyle}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {children}
    </div>
  )
}

export default Item
