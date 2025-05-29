export default {
  '/api/*': {
    target: import.meta.env.VITE_THIRD_API,
    changeOrigin: true,
  },
}
