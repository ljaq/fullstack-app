import React, { CSSProperties } from 'react'
import './style.less'
import { theme } from 'antd'

interface GeometricPatternProps {
  /** 宽度 */
  width?: number | string
  /** 高度 */
  height?: number | string
  /** 图案大小 */
  patternSize?: number
  /** 线条宽度 */
  strokeWidth?: number
  /** 自定义类名 */
  className?: string
}

const GeometricPattern: React.FC<GeometricPatternProps> = ({ patternSize = 50, strokeWidth = 1, className = '' }) => {
  const { token } = theme.useToken()
  // 生成SVG图案定义
  const generatePattern = () => {
    const unit = patternSize / 4

    return (
      <defs>
        <pattern
          id='geometricPattern'
          x='0'
          y='0'
          width={patternSize}
          height={patternSize}
          patternUnits='userSpaceOnUse'
        >
          <g stroke={token.colorPrimary} strokeWidth={strokeWidth} fill='none' strokeLinecap='round'>
            <line x1={2} y1={unit - 2} x2={unit * 2 - 2} y2={2} className='animated-line line-1' />
            <line x1={unit * 2 + 2} y1={2} x2={unit * 4 - 4} y2={unit - 2} className='animated-line line-2' />
            <line
              x1={unit * 4 - 1}
              y1={unit + 2}
              x2={unit * 4 - 1}
              y2={unit * 3 - 2}
              className='animated-line line-3'
            />
            <line
              x1={unit * 4 - 4}
              y1={unit * 3 + 2}
              x2={unit * 2 + 2}
              y2={unit * 4 - 2}
              className='animated-line line-4'
            />
            <line x1={unit * 2 - 2} y1={unit * 4 - 2} x2={2} y2={unit * 3 + 2} className='animated-line line-5' />
            {/* <line x1={0} y1={unit * 3 + 2} x2={0} y2={unit - 2} /> */}

            <line x1={unit * 2 - 2} y1={unit * 2 - 2} x2={2} y2={unit + 2} className='animated-line line-6' />
            <line x1={unit * 2} y1={unit * 2 - 3} x2={unit * 2} y2={3} className='animated-line line-7' />
            <line
              x1={unit * 2 + 2}
              y1={unit * 2 - 2}
              x2={unit * 4 - 4}
              y2={unit + 2}
              className='animated-line line-8'
            />
            <line
              x1={unit * 2 + 2}
              y1={unit * 2 + 2}
              x2={unit * 4 - 4}
              y2={unit * 3 - 2}
              className='animated-line line-9'
            />
            <line x1={unit * 2} y1={unit * 2 + 3} x2={unit * 2} y2={unit * 4 - 3} className='animated-line line-10' />
            <line x1={unit * 2 - 2} y1={unit * 2 + 2} x2={2} y2={unit * 3 - 2} className='animated-line line-11' />
          </g>
        </pattern>
      </defs>
    )
  }

  return (
    <div className={`geometric-pattern-container ${className}`}>
      <svg width='100%' height='100%' preserveAspectRatio='xMidYMid slice'>
        {generatePattern()}

        {/* 图案层 - 背景透明，只有连线，连线使用渐变描边 */}
        <rect x='0' y='0' width='100%' height='100%' fill='url(#geometricPattern)' />
      </svg>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '62.8%',
          backgroundImage: `radial-gradient(ellipse at bottom left, ${token.colorPrimary} 0%, transparent 50%)`,
          opacity: 0.1,
        }}
      ></div>
    </div>
  )
}

export default function Bg() {
  const { token } = theme.useToken()
  return (
    <div className='bg' style={{ '--pattern-primary-color': token.colorPrimary } as CSSProperties}>
      <div className='geo-container'>
        <GeometricPattern />
      </div>
      <div className='radial-1'></div>
      <div className='radial-2'></div>
    </div>
  )
}
