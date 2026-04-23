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
      external: ['dotenv'],
      output: {
        banner: esmDirnameShim,
      },
    },
  }
}
