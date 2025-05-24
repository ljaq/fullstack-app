export default {
  '/api/*': {
    target: import.meta.env.VITE_SERVER_API,
    changeOrigin: true,
  },
}
