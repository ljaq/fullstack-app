export default {
  '/api/*': {
    target: process.env.VITE_THIRD_API,
    changeOrigin: true,
  },
}
