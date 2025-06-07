import { useRef, useState, useEffect, Suspense, Fragment } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, MeshDistortMaterial, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { useClonedGLTF } from 'client/hooks/useCloneGLTF'
// import envbg from 'assets/potsdamer_platz_1k.hdr'

// 创建水体效果
function Water() {
  const waterRef = useRef<THREE.Mesh>(null)

  useFrame(state => {
    // 创建水波效果
    if (waterRef.current) {
      waterRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1 + 20
      waterRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.2) * 0.05
    }
  })

  return (
    <mesh ref={waterRef} position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[1000, 1000, 128, 128]} />
      <MeshDistortMaterial
        color='#1a5e9d'
        opacity={0.8}
        transmission={0.8}
        transparent={true}
        thickness={0.5}
        ior={1.33}
        roughness={1}
        metalness={0}
        distort={0.5}
        speed={4}
      />
    </mesh>
  )
}

function Fish1({ position, speed }) {
  const fishRef = useRef<THREE.Group>(null)
  const { animations, scene } = useClonedGLTF('/glb/fish1.glb')
  const { actions } = useAnimations(animations, fishRef)
  const [rotation, setRotation] = useState(0)
  const [targetPosition] = useState(() => {
    const angle = Math.random() * Math.PI * 2
    const radius = 15
    return new THREE.Vector3(Math.cos(angle) * radius, 2 + Math.random() * 6, Math.sin(angle) * radius)
  })

  useFrame((_, delta) => {
    if (!fishRef.current) return

    fishRef.current.position.lerp(targetPosition, delta * speed * 0.1)

    // 计算旋转方向
    const direction = new THREE.Vector3()
    direction.subVectors(targetPosition, fishRef.current.position).normalize()
    const targetRotation = Math.atan2(direction.x, direction.z)

    // 平滑旋转
    setRotation(prev => {
      const diff = targetRotation - prev
      const adjustedDiff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI
      return prev + adjustedDiff * 0.1
    })

    // 如果鱼接近目标位置，设置新的目标位置
    if (fishRef.current.position.distanceTo(targetPosition) < 0.5) {
      const angle = Math.random() * Math.PI * 2
      const radius = 15
      targetPosition.set(Math.cos(angle) * radius, 2 + Math.random() * 6, Math.sin(angle) * radius)
    }

    // 应用旋转
    fishRef.current.rotation.y = rotation
  })

  useEffect(() => {
    if (animations && animations.length > 0 && actions) {
      animations.forEach(animation => {
        actions[animation.name]?.play()
      })
    }
  }, [actions, animations])

  return (
    <group ref={fishRef} position={position}>
      <primitive object={scene} scale={5} />
    </group>
  )
}

function Fish2({ position, speed }) {
  const fishRef = useRef<THREE.Group>(null)
  const { animations, scene } = useClonedGLTF('/glb/fish2.glb')
  const { actions } = useAnimations(animations, fishRef)
  const [rotation, setRotation] = useState(0)
  const [targetPosition] = useState(() => {
    const angle = Math.random() * Math.PI * 2
    const radius = 15
    return new THREE.Vector3(Math.cos(angle) * radius, 2 + Math.random() * 6, Math.sin(angle) * radius)
  })

  useFrame((_, delta) => {
    if (!fishRef.current) return

    // 移动鱼
    fishRef.current.position.lerp(targetPosition, delta * speed * 0.1)

    // 计算旋转方向
    const direction = new THREE.Vector3()
    direction.subVectors(targetPosition, fishRef.current.position).normalize()
    const targetRotation = Math.atan2(direction.x, direction.z)

    // 平滑旋转
    setRotation(prev => {
      const diff = targetRotation - prev
      const adjustedDiff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI
      return prev + adjustedDiff * 0.1
    })

    // 如果鱼接近目标位置，设置新的目标位置
    if (fishRef.current.position.distanceTo(targetPosition) < 0.5) {
      const angle = Math.random() * Math.PI * 2
      const radius = 15
      targetPosition.set(Math.cos(angle) * radius, 2 + Math.random() * 6, Math.sin(angle) * radius)
    }

    // 应用旋转
    fishRef.current.rotation.y = rotation
  })

  useEffect(() => {
    if (animations && animations.length > 0 && actions) {
      animations.forEach(animation => {
        actions[animation.name]?.play()
      })
    }
  }, [actions, animations])

  return (
    <group ref={fishRef} position={position}>
      <primitive object={scene} scale={0.1} />
    </group>
  )
}

function Fish3({ position, speed }) {
  const fishRef = useRef<THREE.Group>(null)
  const { animations, scene } = useClonedGLTF('/glb/fish3.glb')
  const { actions } = useAnimations(animations, fishRef)
  const [rotation, setRotation] = useState(0)
  const [targetPosition] = useState(() => {
    const angle = Math.random() * Math.PI * 2
    const radius = 15
    return new THREE.Vector3(Math.cos(angle) * radius, 2 + Math.random() * 6, Math.sin(angle) * radius)
  })

  useFrame((_, delta) => {
    if (!fishRef.current) return

    // 移动鱼
    fishRef.current.position.lerp(targetPosition, delta * speed * 0.1)

    // 计算旋转方向
    const direction = new THREE.Vector3()
    direction.subVectors(targetPosition, fishRef.current.position).normalize()
    const targetRotation = Math.atan2(direction.x, direction.z)

    // 平滑旋转
    setRotation(prev => {
      const diff = targetRotation - prev
      const adjustedDiff = ((diff + Math.PI) % (Math.PI * 2)) - Math.PI / 2
      return prev + adjustedDiff * 0.1
    })

    // 如果鱼接近目标位置，设置新的目标位置
    if (fishRef.current.position.distanceTo(targetPosition) < 0.5) {
      const angle = Math.random() * Math.PI * 2
      const radius = 15
      targetPosition.set(Math.cos(angle) * radius, 2 + Math.random() * 6, Math.sin(angle) * radius)
    }

    // 应用旋转
    fishRef.current.rotation.y = rotation
  })

  useEffect(() => {
    if (animations && animations.length > 0 && actions) {
      animations.forEach(animation => {
        actions[animation.name]?.play()
      })
    }
  }, [actions, animations])

  return (
    <group ref={fishRef} position={position}>
      <primitive object={scene} scale={8} />
    </group>
  )
}

// 创建气泡效果
function Bubbles({ position, speed }) {
  const bubblesRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (!bubblesRef.current) {
      return
    }
    bubblesRef.current.position.y += speed * delta
    if (bubblesRef.current.position.y > 20) {
      bubblesRef.current.position.y = -1
    }
  })

  return (
    <group ref={bubblesRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.05 + Math.random() * 0.05, 16, 16]} />
        <meshStandardMaterial color='#ffffff' transparent opacity={0.8} roughness={0} metalness={0.5} />
      </mesh>
    </group>
  )
}

// 创建水草
function Seaweed1({ position }) {
  const seaweedRef = useRef<THREE.Group>(null)
  const { scene } = useClonedGLTF('/glb/weed1/scene.gltf')

  useFrame(state => {
    if (seaweedRef.current) {
      // 水草摆动效果
      seaweedRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2
    }
  })

  return (
    <group ref={seaweedRef} position={position}>
      <primitive object={scene} scale={60} />
    </group>
  )
}
function Seaweed2({ position }) {
  const { scene } = useClonedGLTF('/glb/weed2/scene.gltf')

  return (
    <group position={position}>
      <primitive object={scene} scale={0.008} />
    </group>
  )
}
function Seaweed3({ position }) {
  const seaweedRef = useRef<THREE.Group>(null)
  const { scene } = useClonedGLTF('/glb/weed3/scene.gltf')

  useFrame(state => {
    if (seaweedRef.current) {
      seaweedRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2
    }
  })

  return (
    <group ref={seaweedRef} position={position}>
      <primitive object={scene} scale={1} />
    </group>
  )
}

// 海底地形
function Seabed() {
  return (
    <group position={[0, 0, 0]}>
      {/* 海底 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color='#674f46' roughness={0.9} />
      </mesh>
      {/* 岩石生成 */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh
          key={`rock-${i}`}
          position={[Math.random() * 100 - 50, 0, Math.random() * 100 - 50]}
          scale={[1 + Math.random(), 0.5 + Math.random(), 1 + Math.random()]}
        >
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color='#6b5e4c' roughness={0.8} />
        </mesh>
      ))}
      {Array.from({ length: 60 }).map((_, i) => (
        <mesh
          key={`rock-${i}`}
          position={[Math.random() * 100 - 50, 0, Math.random() * 100 - 50]}
          scale={[1 + Math.random(), 0.5 + Math.random(), 1 + Math.random()]}
        >
          <dodecahedronGeometry args={[0.5, 0]} />
          <meshStandardMaterial color='#7f8c8d' roughness={0.8} />
        </mesh>
      ))}

      {/* 水草分布 */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Seaweed1 key={`seaweed-${i}`} position={[Math.random() * 100 - 50, 0, Math.random() * 100 - 50]} />
      ))}
      {Array.from({ length: 3 }).map((_, i) => (
        <Seaweed2 key={`seaweed-${i}`} position={[Math.random() * 100 - 50, 0, Math.random() * 100 - 50]} />
      ))}
      {/* 水草分布 */}
      {Array.from({ length: 30 }).map((_, i) => (
        <Seaweed3 key={`seaweed-${i}`} position={[Math.random() * 100 - 50, 0, Math.random() * 100 - 50]} />
      ))}
    </group>
  )
}

// 水底世界场景
function UnderwaterScene() {
  return (
    <Fragment>
      <Water />
      <Seabed />
      {/* 鱼群 */}
      {Array(10)
        .fill(true)
        .map((_, i) => (
          <Fish1
            key={i}
            position={[(Math.random() - 0.5) * 100, 2 + Math.random() * 6, (Math.random() - 0.5) * 100]}
            speed={0.2 + Math.random() * 0.5}
          />
        ))}
      {Array(5)
        .fill(true)
        .map((_, i) => (
          <Fish3
            key={i}
            position={[(Math.random() - 0.5) * 100, 2 + Math.random() * 6, (Math.random() - 0.5) * 100]}
            speed={0.5 + Math.random() * 1.5}
          />
        ))}
      {Array(30)
        .fill(true)
        .map((_, i) => (
          <Fish2
            key={i}
            position={[(Math.random() - 0.5) * 100, 2 + Math.random() * 6, (Math.random() - 0.5) * 100]}
            speed={0.2 + Math.random() * 0.5}
          />
        ))}
      {/* 气泡 */}
      {Array(100)
        .fill(true)
        .map((_, i) => (
          <Bubbles
            key={i}
            position={[(Math.random() - 0.5) * 50, Math.random() * 20 - 1, (Math.random() - 0.5) * 50]}
            speed={Math.random() * 2 + 0.6}
          />
        ))}
      <ambientLight intensity={0.3} color='#fff' />
      <directionalLight position={[10, 10, 5]} intensity={1} color='#fff' castShadow />
      <fog attach='fog' args={['#1a5e9d', 20, 80]} />
    </Fragment>
  )
}

// 主应用组件
export default function UnderwaterWorld() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: 'linear-gradient(to bottom, #1a5e9d, #000)' }}>
      <Canvas camera={{ position: [0, 5, 15], fov: 75 }}>
        <Suspense fallback={null}>
          <UnderwaterScene />
        </Suspense>
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={30}
          maxPolarAngle={(Math.PI / 2) * 0.99}
        />
        {/* <Environment files={envbg} /> */}
      </Canvas>
    </div>
  )
}

export const pageConfig = {
  name: 'Home',
}
