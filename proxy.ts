const proxy = {
  '/api/*': {
    target: process.env.VITE_THIRD_API,
    changeOrigin: true,
  },
}

export const getProxy = () => proxy
