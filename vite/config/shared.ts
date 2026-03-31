import type { ResolveOptions } from 'vite'


export function getSharedResolve(): ResolveOptions {
  return {
    tsconfigPaths: true
  }
}
