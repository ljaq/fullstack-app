import type { BuildOptions } from 'vite'

const esmDirnameShim = `import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
`

export function getServerBuildConfig(): BuildOptions {
  return {
    copyPublicDir: false,
    rollupOptions: {
      /** 含原生绑定或大型运行时依赖，不可打进单文件 bundle */
      external: ['dotenv', 'better-sqlite3', 'canvas', 'cesium', 'three', 'draco3d'],
      output: {
        banner: esmDirnameShim,
      },
    },
  }
}
