import { theme } from 'antd'
import { useEffect, useRef, type HTMLAttributes } from 'react'

const PARTICLE_COUNT = 78
const ROTATE = true
const TRAIL_SPAN = 0.1
const DURATION_MS = 5400
const ROTATION_DURATION_MS = 10000
const PULSE_DURATION_MS = 4600
const STROKE_WIDTH = 4.5
const ROSE_A = 9.2
const ROSE_A_BOOST = 0.6
const ROSE_BREATH_BASE = 0.72
const ROSE_BREATH_BOOST = 0.28
const ROSE_K = 5
const ROSE_SCALE = 3.25

function normalizeProgress(progress: number) {
  return ((progress % 1) + 1) % 1
}

function getDetailScale(time: number) {
  const pulseProgress = (time % PULSE_DURATION_MS) / PULSE_DURATION_MS
  const pulseAngle = pulseProgress * Math.PI * 2
  return 0.52 + ((Math.sin(pulseAngle + 0.55) + 1) / 2) * 0.48
}

function getRotation(time: number) {
  if (!ROTATE) return 0
  return -((time % ROTATION_DURATION_MS) / ROTATION_DURATION_MS) * 360
}

function samplePoint(progress: number, detailScale: number) {
  const t = progress * Math.PI * 2
  const a = ROSE_A + detailScale * ROSE_A_BOOST
  const k = Math.round(ROSE_K)
  const r = a * (ROSE_BREATH_BASE + detailScale * ROSE_BREATH_BOOST) * Math.cos(k * t)
  return {
    x: 50 + Math.cos(t) * r * ROSE_SCALE,
    y: 50 + Math.sin(t) * r * ROSE_SCALE,
  }
}

function buildPath(detailScale: number, steps = 480) {
  return Array.from({ length: steps + 1 }, (_, index) => {
    const p = samplePoint(index / steps, detailScale)
    return `${index === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
  }).join(' ')
}

function getParticle(index: number, progress: number, detailScale: number) {
  const tailOffset = index / (PARTICLE_COUNT - 1)
  const p = samplePoint(normalizeProgress(progress - tailOffset * TRAIL_SPAN), detailScale)
  const fade = Math.pow(1 - tailOffset, 0.56)
  return {
    cx: p.x,
    cy: p.y,
    r: 0.9 + fade * 2.7,
    opacity: 0.04 + fade * 0.96,
  }
}

export type RoseCurveLoadingProps = HTMLAttributes<HTMLDivElement> & {
  percent?: number | 'auto'
  size?: 'small' | 'medium' | 'large' | number
}

/**
 * Rose curve loading animation (from rose polar equation r = a cos(kθ)), wired to Ant Design theme primary color.
 */
export default function RoseCurveLoading({ className, style, percent: _percent, size = 'medium', ...rest }: RoseCurveLoadingProps) {
  const {
    token: { colorPrimary },
  } = theme.useToken()
  const sizeValue = typeof size === 'number' ? size : size === 'small' ? 1 : size === 'large' ? 3 : 2
  const groupRef = useRef<SVGGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const circlesRef = useRef<(SVGCircleElement | null)[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const startedAt = performance.now()
    const render = (now: number) => {
      const time = now - startedAt
      const progress = (time % DURATION_MS) / DURATION_MS
      const detailScale = getDetailScale(time)
      const group = groupRef.current
      const path = pathRef.current
      if (group) {
        group.setAttribute('transform', `rotate(${getRotation(time)} 50 50)`)
      }
      if (path) {
        path.setAttribute('d', buildPath(detailScale))
      }
      circlesRef.current.forEach((node, index) => {
        if (!node) return
        const particle = getParticle(index, progress, detailScale)
        node.setAttribute('cx', particle.cx.toFixed(2))
        node.setAttribute('cy', particle.cy.toFixed(2))
        node.setAttribute('r', particle.r.toFixed(2))
        node.setAttribute('opacity', particle.opacity.toFixed(3))
      })
      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div
      className={className}
      style={{
        color: colorPrimary,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        verticalAlign: '-0.125em',
        ...style,
      }}
      {...rest}
    >
      <svg
        viewBox='0 0 100 100'
        fill='none'
        aria-hidden
        style={{ width: `${sizeValue}em`, height: `${sizeValue}em`, display: 'block', overflow: 'visible' }}
      >
        <g ref={groupRef}>
          <path
            ref={pathRef}
            stroke='currentColor'
            strokeLinecap='round'
            strokeLinejoin='round'
            opacity={0.1}
            strokeWidth={STROKE_WIDTH}
          />
          {Array.from({ length: PARTICLE_COUNT }, (_, i) => (
            <circle
              key={i}
              ref={(el) => {
                circlesRef.current[i] = el
              }}
              fill='currentColor'
            />
          ))}
        </g>
      </svg>
    </div>
  )
}
