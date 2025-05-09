import React, { CSSProperties, useMemo } from 'react'
import { useTransition, animated, UseTransitionProps } from '@react-spring/web'

interface IProps {
  direction?: 'left' | 'right' | 'top' | 'bottom'
  distance?: number
  children: React.ReactNode
  animationProps?: UseTransitionProps
  style?: CSSProperties
}

const Translate = (props: IProps) => {
  const { direction = 'left', distance = 40, children, animationProps = {}, style = {} } = props
  const items = React.Children.toArray(children)

  const fromConf = useMemo(() => {
    switch (direction) {
      case 'left':
        return {
          type: 'translateX',
          distance: -distance,
        }
      case 'right':
        return {
          type: 'translateX',
          distance,
        }
      case 'top':
        return {
          type: 'translateY',
          distance: -distance,
        }
      case 'bottom':
        return {
          type: 'translateY',
          distance,
        }
    }
  }, [distance, direction])

  const transitions = useTransition(items, {
    keys: (item: any) => item.key,
    from: {
      opacity: 0,
      transform: `${fromConf.type}(${fromConf.distance}px)`,
      position: 'absolute',
      top: 0,
    },
    enter: {
      opacity: 1,
      transform: `${fromConf.type}(0px)`,
      delay: 50,
      position: 'static',
    },
    leave: {
      opacity: 0,
      transform: `${fromConf.type}(${-fromConf.distance}px)`,
      position: 'absolute',
      top: 0,
    },
    config: { tension: 300, friction: 30 },
    trail: 50,
    unique: false,
    exitBeforeEnter: false,
    ...animationProps,
  })

  return (
    <div style={{ position: 'relative', ...style }}>
      {transitions((style, item) => (
        <animated.div
          style={
            {
              ...style,
              width: '100%',
              willChange: 'transform, opacity',
            } as any
          }
        >
          {item}
        </animated.div>
      ))}
    </div>
  )
}

export default Translate
