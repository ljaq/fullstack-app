import { useMemo } from 'react';
import { useGraph } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { SkeletonUtils } from 'three-stdlib';
import { AnimationClip, Material, SkinnedMesh } from 'three';

interface UseClonedGLTF<N, M> {
  nodes: Record<string, N>;
  materials: Record<string, M>;
  scene: any;
  animations: AnimationClip[];
}

export function useClonedGLTF<N = SkinnedMesh, M = Material>(src: string) {
  const { scene, animations } = useGLTF(src);
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes, materials } = useGraph(clone);

  return { nodes, materials, scene: clone, animations } as UseClonedGLTF<N, M>;
}