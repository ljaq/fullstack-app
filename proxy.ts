export default {
  '/api': {
    target: process.env.VITE_SERVER_API,
    changeOrigin: true,
  },
}
